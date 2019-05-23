function determinationCoefficient(data, results) {
  const predictions = [];
  const observations = [];

  data.forEach((d, i) => {
    if (d[1] !== null) {
      observations.push(d);
      predictions.push(results[i]);
    }
  });

  const sum = observations.reduce((a, observation) => a + observation[1], 0);
  const mean = sum / observations.length;

  const ssyy = observations.reduce((a, observation) => {
    const difference = observation[1] - mean;
    return a + difference * difference;
  }, 0);

  const sse = observations.reduce((accum, observation, index) => {
    const prediction = predictions[index];
    const residual = observation[1] - prediction[1];
    return accum + residual * residual;
  }, 0);

  return 1 - sse / ssyy;
}

function round(number, precision) {
  const factor = 10 ** precision;
  return Math.round(number * factor) / factor;
}

export function linear(data, precision) {
  const sum = [0, 0, 0, 0, 0];
  let len = 0;

  for (let n = 0; n < data.length; n++) {
    if (data[n][1] !== null) {
      len++;
      sum[0] += data[n][0];
      sum[1] += data[n][1];
      sum[2] += data[n][0] * data[n][0];
      sum[3] += data[n][0] * data[n][1];
      sum[4] += data[n][1] * data[n][1];
    }
  }

  const run = len * sum[2] - sum[0] * sum[0];
  const rise = len * sum[3] - sum[0] * sum[1];
  const gradient = run === 0 ? 0 : round(rise / run, precision);
  const intercept = round(sum[1] / len - (gradient * sum[0]) / len, precision);

  const predict = x => [
    round(x, precision),
    round(gradient * x + intercept, precision)
  ];

  const points = data.map(point => predict(point[0]));

  return {
    points,
    predict,
    equation: [gradient, intercept],
    r2: round(determinationCoefficient(data, points), precision),
    string:
      intercept === 0 ? `y = ${gradient}x` : `y = ${gradient}x + ${intercept}`
  };
}
