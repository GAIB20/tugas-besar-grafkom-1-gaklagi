const objects = [];
let drawState = '';
let hoveredObjectId = -1;
let hoveredVertexId = -1;
let selectedObjectId = -1;
let selectedVertexId = -1;
let currentCoor = [0, 0];
const epsilon = 0.02;

const canvas = document.getElementById('canvas');
const draw_buttons = document.querySelectorAll('.draw-button');
const draw_status = document.getElementById('draw-status');
const current_coor = document.getElementById('current-coor');
const active_object = document.getElementById('active-object');

// MOUSE LISTENER
canvas.addEventListener('dblclick', (e) => {

    if (drawState == 'translation') {
        drawState = '';
        selectedObjectId = -1;
        selectedVertexId = -1;
    }

    setDrawStatus();
    setPropertyDisplay();
});

canvas.addEventListener('mousemove', (e) => {
    currentCoor = getMouseCoor(e);
    let lastObj = objects[objects.length - 1];

    getActiveObject(currentCoor);

    // MODIFY OBJECT
    if (drawState == 'translation') {
        objects[selectedObjectId].translation(currentCoor);

    }
      
    // DRAW NEW OBJECT
    if (drawState == 'rectangle2') {
        startPointX = lastObj.vertices[0].coor[0];
        startPointY = lastObj.vertices[0].coor[1];
        endPointX = currentCoor[0];
        endPointY = currentCoor[1];
    
        lastObj.moveVertex(1, [startPointX, endPointY])
        lastObj.moveVertex(2, [endPointX, startPointY])
        lastObj.moveVertex(3, currentCoor)
    }
  
    setDrawStatus();
    setPropertyDisplay();
});

canvas.addEventListener('mouseup', (e) => {
    currentCoor = getMouseCoor(e);
    let lastObj = objects[objects.length - 1];
    if (drawState == '') {
        if (hoveredObjectId != -1) {
          if (hoveredVertexId != -1) {

          // SELECT VERTEX
            if (dist(currentCoor, objects[hoveredObjectId].vertices[hoveredVertexId].coor) < epsilon) {
              let clickedObject = objects[hoveredObjectId];
              let clickedVertex = clickedObject.vertices[hoveredVertexId]
              clickedVertex.isSelected = !clickedVertex.isSelected;
              selectedObjectId = hoveredObjectId;
              setPropertyDisplay();
              selectedVertexId = hoveredVertexId;
    
              if (clickedVertex.isSelected) {
                drawState = 'vertex-selected';
    
                objects.forEach((obj) => {
                  obj.vertices.forEach((vertex) => {
                    if (vertex != clickedVertex) {
                      vertex.isSelected = false
                    }
                  })
                  obj.centroid.isSelected = false;
                })
              }
              return;
            }
          }
    
          // SELECT CENTROID
          if ((dist(currentCoor, objects[hoveredObjectId].centroid.coor) < epsilon) ||
              (dist(currentCoor, objects[selectedObjectId].centroid.coor) < epsilon)) {
            let clickedObject = objects[hoveredObjectId];
            clickedObject.centroid.isSelected = !clickedObject.centroid.isSelected;
            selectedObjectId = hoveredObjectId;
            setPropertyDisplay();
            selectedVertexId = -1;
            console.log(clickedObject.centroid.isSelected)
    
            //drawState = 'translation';
            drawState = 'selected'
    
            objects.forEach((obj) => {
              obj.vertices.forEach((vertex) => {
                vertex.isSelected = false
              })
              if (obj != clickedObject) {
                obj.centroid.isSelected = false;
              }
            })
          }
        } else {
          objects.forEach((obj) => {
            obj.vertices.forEach((vertex) => {
              vertex.isSelected = false;
            })
            obj.centroid.isSelected = false;
            selectedObjectId = -1;
            setPropertyDisplay();
            selectedVertexId = -1;
          })
        }
    } else if (drawState == 'selected') {

        if (hoveredObjectId != -1) {
            // SELECT CENTROID AGAIN TO TRANSLATE
            if ((dist(currentCoor, objects[hoveredObjectId].centroid.coor) < epsilon) ||
                (dist(currentCoor, objects[selectedObjectId].centroid.coor) < epsilon)) {
                let clickedObject = objects[hoveredObjectId];
                clickedObject.centroid.isSelected = !clickedObject.centroid.isSelected;
                selectedObjectId = hoveredObjectId;
                setPropertyDisplay();
                selectedVertexId = -1;
                console.log(clickedObject.centroid.isSelected)

                drawState = 'translation';

                objects.forEach((obj) => {
                    obj.vertices.forEach((vertex) => {
                        vertex.isSelected = false
                    })
                    if (obj != clickedObject) {
                        obj.centroid.isSelected = false;
                    }
                })
        }
        } else {
            objects.forEach((obj) => {
                obj.vertices.forEach((vertex) => {
                vertex.isSelected = false;
                })
                obj.centroid.isSelected = false;
                selectedObjectId = -1;
                setPropertyDisplay();
                selectedVertexId = -1;
            })
        }
   
    } else if (drawState == 'rectangle') {
        lastObj.moveVertex(0, currentCoor);
        drawState = 'rectangle2';
    
    } else if (drawState == 'rectangle2') {
        drawState = '';
    }
    setDrawStatus();
    setPropertyDisplay();
});

const getActiveObject = (currentCoor) => {
    let isExist = false;
  
    objects.forEach((obj) => {
      // Hover or Click Vertices
      obj.vertices.forEach((vertex) => {
        if (dist(vertex.coor, currentCoor) < epsilon) {
          if (hoveredObjectId == -1) {
            hoveredObjectId = obj.id;
            hoveredVertexId = vertex.id;
            vertex.isHovered = true;
            obj.centroid.isHovered = true;
  
          } else if (hoveredObjectId == obj.id) {
            
          } else {
            let oldObj = objects[hoveredObjectId];
            let oldVertex = oldObj.vertices[hoveredVertexId];
            if (dist(vertex.coor, currentCoor) < dist(oldVertex.coor, currentCoor)) {
              hoveredObjectId = obj.id;
              hoveredVertexId = vertex.id;
              vertex.isHovered = true;
              obj.centroid.isHovered = true;
              oldVertex.isHovered = false;
              oldObj.centroid.isHovered = false;
            }
          }
          isExist = true;
        }
      });
  
      // Hover or Click Objects
      if (dist(obj.centroid.coor, currentCoor) < epsilon) {
        if (hoveredObjectId == -1) {
          hoveredObjectId = obj.id;
          hoveredVertexId = -1;
          obj.centroid.isHovered = true;
        } else if (hoveredObjectId == obj.id) {
  
        } else {
          let oldObj = objects[hoveredObjectId];
          if (dist(obj.centroid.coor, currentCoor) < dist(oldObj.centroid.coor, currentCoor)) {
            hoveredObjectId = obj.id;
            hoveredVertexId = -1;
            obj.centroid.isHovered = true;
            oldObj.centroid.isHovered = false;
          }
        }
        isExist = true;
      }
    });
  
    if (!isExist) {
      hoveredObjectId = -1;
      hoveredVertexId = -1;
  
      objects.forEach((obj) => {
        obj.vertices.forEach((vertex) => {
          vertex.isHovered = false;
        });
        obj.centroid.isHovered = false;
      });
    }
  };

// OBJECT PROPERTY MODIFIER
const setPropertyDisplay = () => {
    const setter = (line, square, rectangle, polygon) => {
        sm_rectangle.style.display = rectangle;
    }

    if (selectedObjectId != -1) {
      if (objects[selectedObjectId].getModelName() == 'Rectangle') {
        setter('none', 'none', 'block', 'none');
        rectangle_length_slider.value = objects[selectedObjectId].getLength();
        rectangle_length_value.innerHTML = `Length: ${rectangle_length_slider.value}`
        rectangle_width_slider.value = objects[selectedObjectId].getWidth();
        rectangle_width_value.innerHTML = `Width: ${rectangle_width_slider.value}`
      } else {
        setter('none', 'none', 'none', 'none');
        active_object.innerHTML = 'Object unknown';
      }
      active_object.innerHTML = `[${selectedObjectId}] ${objects[selectedObjectId].getModelName()}`;
    } else {
      setter('none', 'none', 'none', 'none');
      active_object.innerHTML = 'No object selected';
    }
}

// DRAW ACTIONS
draw_buttons.forEach((button) => {
    button.addEventListener('click', (e) => {
      drawAction(e.target.id);
    });
});

const drawAction = (model) => {
    if (drawState == '') {
      draw_status.innerHTML = `Drawing ${model} ...`;
      drawState = model;
      if (model == 'rectangle') {
        objects.push(new Rectangle(objects.length));
      }
    } else {
      draw_status.innerHTML = 'Please finish drawing the previous object';
    }
};

const setDrawStatus = () => {
    switch (drawState) {
        case '':
            draw_status.innerHTML = 'No action, click a button to draw';
            break;
        case 'translation':
            draw_status.innerHTML = `Translating object ${selectedObjectId}, double click to finish ...`;
            break;
        case 'rectangle':
            draw_status.innerHTML = 'Drawing rectangle, choose first vertex ...';
            break;
        case 'rectangle2':
            draw_status.innerHTML = 'Drawing rectangle, click to finish ...';
            break;
        default:
            if (selectedObjectId != -1) {
                draw_status.innerHTML = `Modifying object ${selectedObjectId}, click center again to translate`;
            } else {
                draw_status.innerHTML = 'No action, click a button to draw';
            }        
            break;
    }
}

// SPECIAL METHOD RECTANGLE
const sm_rectangle = document.getElementById('special-method-rectangle');
const rectangle_length_slider = document.getElementById('rectangle-length-slider');
const rectangle_length_value = document.getElementById('rectangle-length-value');
const rectangle_width_slider = document.getElementById('rectangle-width-slider');
const rectangle_width_value = document.getElementById('rectangle-width-value');

rectangle_length_slider.addEventListener('input', (e) => {
  const length = parseFloat(e.target.value);
  rectangle_length_value.innerHTML = `Length: ${length}`;
  if (selectedObjectId != -1) {
    if (objects[selectedObjectId].getModelName() == 'Rectangle') {
      objects[selectedObjectId].setLength(length);
    }
  }
  console.log(objects[selectedObjectId].getLength());
});

rectangle_width_slider.addEventListener('input', (e) => {
  const width = parseFloat(e.target.value);
  rectangle_width_value.innerHTML = `Width: ${width}`;
  if (selectedObjectId != -1) {
    if (objects[selectedObjectId].getModelName() == 'Rectangle') {
      objects[selectedObjectId].setWidth(width);
    }
  }
  console.log(objects[selectedObjectId].getWidth());
});
