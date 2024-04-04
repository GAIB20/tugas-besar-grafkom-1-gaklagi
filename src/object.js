class Point {
    constructor(coor, color, id=-1, isCentroid=false) {
        this.id = id;
        this.coor = coor;
        this.color = color;
        this.isSelected = false;
        this.isHovered = false;
        this.isCentroid = isCentroid;
    }
  
    setCoor = (coor) => {
      this.coor = coor;
    }
  
    render = (gl, vBuffer, vPosition, cBuffer, vColor) => {
      if (this.isHovered || this.isSelected) {
        const dotVertices = [
            [this.coor[0] - epsilon, this.coor[1] - epsilon],
            [this.coor[0] + epsilon, this.coor[1] - epsilon],
            [this.coor[0] + epsilon, this.coor[1] + epsilon],
            [this.coor[0] - epsilon, this.coor[1] + epsilon],
        ];
        gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(dotVertices), gl.STATIC_DRAW);
        gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vPosition);
        const dotColor = Array(4).fill(this.isSelected ? [1, 0, 0, 1] : (this.isCentroid ? [1, 1, 0, 1] : [0, 0, 1, 1]))
        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, flatten(dotColor), gl.STATIC_DRAW);
        gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(vColor);
        
        gl.drawArrays(gl.TRIANGLE_FAN, 0, dotVertices.length);
      }
    }  
}