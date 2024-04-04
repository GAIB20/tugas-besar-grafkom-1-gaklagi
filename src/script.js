const objects = [];
let drawState = '';
let hoveredObjectId = -1;
let hoveredVertexId = -1;
let selectedObjectId = -1;
let selectedVertexId = -1;
let currentCoor = [0, 0];

const canvas = document.getElementById('canvas');
const draw_buttons = document.querySelectorAll('.draw-button');
