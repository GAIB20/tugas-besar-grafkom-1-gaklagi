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

function saveToFile(json, fileName) {
    const blob = new Blob([json], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
}
  
function loadObjectsFromJsonFileAndAddToCanvas(array, filePath) {
    // Load the JSON file
    fetch(filePath)
      .then(response => response.json())
      .then(objects => {
        // Add each object to the canvas
        objects.forEach(obj => {
            if (obj.type == 'Rectangle') {
                const newObject = new Rectangle(obj.id);
                newObject.setAtrributes(obj.id, obj.vertices, obj.angle, obj.centroid);
                array.push(newObject);
    
            } else if (obj.type == 'Polygon') {
                const newObject = new Polygon(obj.id);
                newObject.setAtrributes(obj.id, obj.vertices, obj.angle, obj.centroid);
                array.push(newObject);
    
            }
        });
      })
      .catch(error => console.error(error));
}