import time
import numpy as np
import scipy.stats as stats
from backend.app.models.schemas import SimulationRequest, SimulationResponse, ExceedancePoint

class MonteCarloEngine:
    @staticmethod
    def run_simulation(req: SimulationRequest) -> SimulationResponse:
        start_time = time.perf_counter()
        np.random.seed(req.seed)

        trials = req.trials

        # 1. Frequency Simulation
        if "poisson" in req.freq_model.lower():
            # Poisson arrival with mean lambda = 7.4
            lambda_param = 7.4
            annual_counts = np.random.poisson(lam=lambda_param, size=trials)
        else:
            # Negative Binomial with r=5.2, p=0.41 (mean ~ 7.4, variance ~ 18.0)
            r_param = 5.2
            p_param = 0.412
            annual_counts = np.random.negative_binomial(n=r_param, p=p_param, size=trials)

        total_events = int(np.sum(annual_counts))

        # 2. Compound Severity Simulation
        if "pareto" in req.sev_model.lower() or "gpd" in req.sev_model.lower():
            # Generalized Pareto with xi=0.38, scale=0.42 ($B), threshold=0.5 ($B)
            # F(x) = 1 - (1 + xi*(x-u)/sigma)^(-1/xi)
            xi = 0.38
            sigma = 0.42
            u = req.tail_threshold
            u_rand = np.random.uniform(0.0001, 0.9999, size=total_events)
            raw_severities = u + (sigma / xi) * ((1.0 - u_rand) ** (-xi) - 1.0)
            # Clip extreme unphysical single-event claims to $500B
            severities = np.clip(raw_severities, 0.05, 500.0)
        elif "weibull" in req.sev_model.lower():
            k_shape = 0.72
            scale = 0.85
            severities = stats.weibull_min.rvs(k_shape, scale=scale, size=total_events)
        else:
            # Lognormal (mu=6.4 on log millions -> ~ 0.6B scale, sigma=1.4)
            mu = -0.45
            sigma = 1.25
            severities = np.random.lognormal(mean=mu, sigma=sigma, size=total_events)

        # 3. Vectorized Aggregation of Annual Losses
        annual_losses = np.zeros(trials, dtype=float)
        if total_events > 0:
            # Split indices using cumulative sum of counts
            split_indices = np.cumsum(annual_counts)[:-1]
            if len(split_indices) > 0:
                event_splits = np.split(severities, split_indices)
                annual_losses = np.array([np.sum(grp) for grp in event_splits])
            else:
                annual_losses[0] = np.sum(severities)

        # 4. Tail Risk Metrics
        aal = float(np.mean(annual_losses))
        std_dev = float(np.std(annual_losses, ddof=1))
        std_err = float(std_dev / np.sqrt(trials))

        def calc_var_tvar(losses_arr, percentile):
            var_val = float(np.percentile(losses_arr, percentile))
            tail = losses_arr[losses_arr >= var_val]
            tvar_val = float(np.mean(tail)) if len(tail) > 0 else var_val
            return round(var_val, 2), round(tvar_val, 2)

        var_90, tvar_90 = calc_var_tvar(annual_losses, 90.0)
        var_95, tvar_95 = calc_var_tvar(annual_losses, 95.0)
        var_99, tvar_99 = calc_var_tvar(annual_losses, 99.0)
        var_99_5, tvar_99_5 = calc_var_tvar(annual_losses, 99.6)

        # 5. Exceedance Probability (EP) Curve
        return_periods = [2, 5, 10, 20, 50, 100, 250, 500]
        ep_curve = []
        for rp in return_periods:
            ep = 1.0 / rp
            p_pct = (1.0 - ep) * 100.0
            v, tv = calc_var_tvar(annual_losses, p_pct)
            ep_curve.append(ExceedancePoint(
                return_period_years=float(rp),
                exceedance_probability=round(ep, 4),
                annual_loss=v,
                tvar=tv
            ))

        # 6. Loss Distribution Histogram / Density
        # Generate 15 bins up to 99th percentile * 1.5
        max_bin_val = max(10.0, var_99 * 1.5)
        hist_counts, bin_edges = np.histogram(annual_losses, bins=16, range=(0, max_bin_val), density=True)
        histogram_data = []
        for i in range(len(hist_counts)):
            loss_mid = float((bin_edges[i] + bin_edges[i+1]) / 2.0)
            density_val = float(hist_counts[i])
            histogram_data.append({
                "loss": round(loss_mid, 1),
                "density": round(density_val, 4)
            })

        runtime = (time.perf_counter() - start_time) * 1000.0

        return SimulationResponse(
            trials=trials,
            seed=req.seed,
            runtime_ms=round(runtime, 1),
            aal=round(aal, 2),
            aal_std_err=round(std_err, 3),
            aal_ci_lower=round(max(0, aal - 1.96 * std_err), 2),
            aal_ci_upper=round(aal + 1.96 * std_err, 2),
            var_90=var_90,
            var_95=var_95,
            var_99=var_99,
            var_99_5=var_99_5,
            tvar_90=tvar_90,
            tvar_95=tvar_95,
            tvar_99=tvar_99,
            tvar_99_5=tvar_99_5,
            exceedance_curve=ep_curve,
            loss_histogram=histogram_data
        )
