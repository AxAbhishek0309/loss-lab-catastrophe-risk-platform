# LossLab Actuarial & Risk Modelling Methodology

## 1. Probabilistic Catastrophe Framework Overview
LossLab evaluates multi-peril catastrophe loss risk using the classical compound Poisson/Negative Binomial collective risk model:

$$S = \sum_{j=1}^{N} X_j$$

where:
- $N$ is the annual catastrophe event arrival count (Frequency distribution).
- $X_j$ is the economic or insured loss severity of the $j$-th event (Severity distribution).
- $S$ is the annual aggregate catastrophe loss across the enterprise or portfolio.

---

## 2. Event Frequency Modelling

### 2.1 Poisson Distribution
The baseline counting process models events with constant arrival intensity $\lambda$:

$$P(N = k) = \frac{\lambda^k e^{-\lambda}}{k!}$$

Assumes equidispersion: $\text{Var}(N) = \mathbb{E}[N] = \lambda$.

### 2.2 Negative Binomial Distribution (Recommended)
Natural perils frequently exhibit temporal and spatial clustering (e.g. earthquake aftershocks, hurricane sequences). Catastrophe data shows $\text{Var}(N) > \mathbb{E}[N]$. The Negative Binomial parameterization accommodates overdispersion:

$$P(N = k) = \binom{k + r - 1}{k} (1 - p)^r p^k$$

Calibrated via Method of Moments and Maximum Likelihood Estimation (MLE).

---

## 3. Loss Severity Distributions

Catastrophe loss severities are heavy-tailed and asymmetric. Standard thin-tailed distributions (e.g. Normal, Exponential) fail to represent extreme 1-in-100 and 1-in-250 year events.

### 3.1 Generalized Pareto Distribution (GPD) / Peak-Over-Threshold (POT)
For threshold $u$, excess losses $Y = X - u \mid X > u$:

$$F(y) = 1 - \left(1 + \frac{\xi y}{\sigma}\right)^{-1/\xi}$$

- $\xi > 0$: Heavy-tailed (Fréchet type), characteristic of seismic and tropical cyclone claims.
- $\sigma$: Scale parameter.

### 3.2 Lognormal Distribution
$$f(x) = \frac{1}{x \sigma \sqrt{2\pi}} \exp\left( -\frac{(\ln x - \mu)^2}{2\sigma^2} \right)$$

### 3.3 Weibull Distribution
$$f(x) = \frac{k}{\lambda} \left(\frac{x}{\lambda}\right)^{k-1} e^{-(x/\lambda)^k}$$

### 3.4 Goodness-of-Fit Criteria
Models are compared using:
- **Akaike Information Criterion (AIC)**: $\text{AIC} = 2k - 2\ln(L)$
- **Bayesian Information Criterion (BIC)**: $\text{BIC} = k \ln(n) - 2\ln(L)$
- **Kolmogorov-Smirnov Statistic ($D$) & $p$-value**: $\sup_x |F_n(x) - F(x)|$

---

## 4. Vectorized Monte Carlo Simulation

1. **Draw Frequency**: For each synthetic year $i \in [1, M]$ (where $M \in [10^4, 10^5]$), sample $N_i \sim \text{FreqDist}$.
2. **Draw Severities**: Draw $\sum N_i$ total losses from the calibrated severity distribution.
3. **Aggregate Annual Losses**: Compute $S_i = \sum_{j=1}^{N_i} X_{i,j}$.
4. **Sort Annual Losses**: $S_{(1)} \le S_{(2)} \le \dots \le S_{(M)}$.

---

## 5. Tail Risk Metrics

### 5.1 Average Annual Loss (AAL)
$$\text{AAL} = \frac{1}{M} \sum_{i=1}^{M} S_i$$

### 5.2 Value-at-Risk (VaR)
For confidence level $\alpha$ (e.g. 99% for 1-in-100 year return period):
$$\text{VaR}_\alpha(S) = \inf \{ s : F_S(s) \ge \alpha \}$$

### 5.3 Tail Value-at-Risk (TVaR / Expected Shortfall)
The conditional expected loss given that loss exceeds VaR:
$$\text{TVaR}_\alpha(S) = \mathbb{E}[S \mid S \ge \text{VaR}_\alpha(S)]$$

TVaR is a coherent risk measure satisfying sub-additivity:
$$\text{TVaR}_\alpha(S_1 + S_2) \le \text{TVaR}_\alpha(S_1) + \text{TVaR}_\alpha(S_2)$$
