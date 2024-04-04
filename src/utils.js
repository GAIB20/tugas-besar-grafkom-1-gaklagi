const dist = (p1, p2) => Math.sqrt(Math.pow(p1[0] - p2[0], 2) + Math.pow(p1[1] - p2[1], 2));

const getMouseCoor = (e) => {
  const x = (2 * (e.clientX - canvas.offsetLeft)) / canvas.clientWidth - 1;
  const y = 1 - (2 * (e.clientY - canvas.offsetTop)) / canvas.clientHeight;
  current_coor.innerHTML = `[${x.toFixed(3)}, ${y.toFixed(3)}]`;
  return [x, y];
};

function flatten(v) {
  let n = v.length * v[0].length;
  const floats = new Float32Array(n);

  let i = 0;
  v.forEach((row) => {
    row.forEach((col) => {
      floats[i++] = col;
    });
  });
  
  return floats;
}