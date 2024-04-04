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

// MOUSE LISTENER
canvas.addEventListener('dblclick', (e) => {
    setDrawStatus();
  });

canvas.addEventListener('mousemove', (e) => {
    currentCoor = getMouseCoor(e);
    let lastObj = objects[objects.length - 1];
      
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
  });

  canvas.addEventListener('mouseup', (e) => {
    currentCoor = getMouseCoor(e);
    let lastObj = objects[objects.length - 1];
    if (drawState == 'rectangle') {
        lastObj.moveVertex(0, currentCoor);
        drawState = 'rectangle2';
    
    } else if (drawState == 'rectangle2') {
        drawState = '';
    }
    setDrawStatus();
  });

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
      case 'rectangle':
        draw_status.innerHTML = 'Drawing rectangle, choose first vertex ...';
        break;
      case 'rectangle2':
        draw_status.innerHTML = 'Drawing rectangle, click to finish ...';
        break;
      default:
        draw_status.innerHTML = 'No action, click a button to draw';
        break;
    }
  }