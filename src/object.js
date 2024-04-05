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

class Model {
    constructor(id){
      this.id = id;
      this.vertices = [];
      this.angle = 0
      this.centroid = new Point([0,0], [0, 0, 0, 1], 99, true);
    }

    getModelName = () => {
      return this.constructor.name;
    }

    addVertex = (coor, color) => {
      this.vertices.push(new Point(coor, color, this.vertices.length));
      this.setCentroid();
    }

    removeLastTwoVertices = () => {
      this.vertices.splice(-2);
      this.setCentroid();
    }

    moveVertex = (id, coor) => {
      this.vertices[id].setCoor(coor);
      this.setCentroid();
    }

    isExistVertex = (coor) => {
      return this.vertices.some((v) => v.coor[0] === coor[0] && v.coor[1] === coor[1]);
    }

    setCentroid = () => {      
      let minX = Math.min(...this.vertices.map((v) => v.coor[0]));
      let minY = Math.min(...this.vertices.map((v) => v.coor[1]));
      let maxX = Math.max(...this.vertices.map((v) => v.coor[0]));
      let maxY = Math.max(...this.vertices.map((v) => v.coor[1]));

      this.centroid.coor = [(minX + maxX) / 2, (minY + maxY) / 2];
    }

    renderDot = (gl, vBuffer, vPosition, cBuffer, vColor) => {
        this.vertices.forEach((v) => {
          v.render(gl, vBuffer, vPosition, cBuffer, vColor);
        });
        this.centroid.render(gl, vBuffer, vPosition, cBuffer, vColor);
    }

    translation = (coor) => {
        let dx = coor[0] - this.centroid.coor[0];
        let dy = coor[1] - this.centroid.coor[1];
        this.vertices.forEach((v) => {
          v.coor[0] += dx;
          v.coor[1] += dy;
        });
        this.setCentroid();
    }

    dilation = (vertexId, coor) => {
        const startPointY = this.vertices[vertexId].coor[1];
        const endPointY = coor[1];
    
        const centroidX = this.centroid.coor[0];
        const centroidY = this.centroid.coor[1];    
    
        const dilationFactor = (endPointY - centroidY)/(startPointY - centroidY);
    
        this.vertices.forEach((vertex) => {
          vertex.coor[0] = dilationFactor * (vertex.coor[0] - centroidX) + centroidX;
          vertex.coor[1] = dilationFactor * (vertex.coor[1] - centroidY) + centroidY;
        });  
    }

    rotate = (newAngle, isMoving = false) => {
      
        const angleInDegrees = newAngle - this.angle
        this.angle = isMoving ? this.angle : newAngle
        const angleInRadians = angleInDegrees * Math.PI / 180
        
        this.vertices.forEach((vertex) => {
          var oldX = vertex.coor[0] - this.centroid.coor[0]
          var oldY = vertex.coor[1] - this.centroid.coor[1]
          
          vertex.coor[0] = this.centroid.coor[0] + (oldX * Math.cos(angleInRadians) - oldY * Math.sin(angleInRadians))
          vertex.coor[1] = this.centroid.coor[1] + (oldX * Math.sin(angleInRadians) + oldY * Math.cos(angleInRadians))
        })
    }

    animate = async() => {
        var id = null
        var degree = 0
        var pos = this.centroid.coor
        clearInterval(id);
        id = setInterval(frame, 60);
  
        const rotate = () => this.rotate(degree)
        const translation = () => this.translation(pos)
  
        function frame() {
          if (degree == 720) {
            clearInterval(id);
          } else if (degree <= 360) {
            pos[0] += 0.01
            pos[1] += 0.01
            degree += 5
            translation()
            rotate()
          } else {
            pos[0] -= 0.01
            pos[1] -= 0.01
            degree += 5
            translation()
            rotate()
          }
        }
    }

}

class Line extends Model {
  constructor(id) {
    super(id);
    this.type = 'Line';
    this.vertices.push(new Point([0, 0], [0, 0, 0, 1], 0));
    this.vertices.push(new Point([0, 0], [0, 0, 0, 1], 1));
  }

  setAtrributes = (id, vertices, angle, centroid) => {
    this.id = id;

    let count = 0;
    this.vertices.forEach(v => {
      v.coor = vertices[count].coor;
      v.color = vertices[count].color;
      count++;
    });
    this.angle = angle;
    this.centroid.coor = centroid.coor;
    this.centroid.color = centroid.color;
    this.centroid.id = centroid.id;
    this.centroid.isCentroid = centroid.isCentroid;
  }

  getLength = () => {
    return dist(this.vertices[0].coor, this.vertices[1].coor)
  }

  setLength = (length) => {
    let dx = this.vertices[1].coor[0] - this.vertices[0].coor[0];
    let dy = this.vertices[1].coor[1] - this.vertices[0].coor[1];
    let angle = Math.atan2(dy, dx);
    let x0 = this.centroid.coor[0] - length * Math.cos(angle)/2;
    let y0 = this.centroid.coor[1] - length * Math.sin(angle)/2;
    let x1 = this.centroid.coor[0] + length * Math.cos(angle)/2;
    let y1 = this.centroid.coor[1] + length * Math.sin(angle)/2;
    this.vertices[0].coor = [x0, y0];
    this.vertices[1].coor = [x1, y1];

    console.log(`x1: ${this.vertices[1].coor[0]}, y1: ${this.vertices[1].coor[1]}`);
    console.log(`x2: ${this.vertices[0].coor[0]}, y2: ${this.vertices[0].coor[1]}`);
    console.log(this.getLength(), length);
  }

  render = (gl) => {
    const verticesCoor = [];
    const verticesColors = [];

    this.vertices.forEach((v) => {
      verticesCoor.push(v.coor);
      verticesColors.push(v.color);
    });

    const vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesCoor), gl.STATIC_DRAW);
    
    const vPosition = gl.getAttribLocation(program, 'vPosition');
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);

    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesColors), gl.STATIC_DRAW);

    const vColor = gl.getAttribLocation(program, 'vColor');
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    gl.drawArrays(gl.LINES, 0, verticesCoor.length);

    this.renderDot(gl, vBuffer, vPosition, cBuffer, vColor)
  }
}

class Square extends Model {
  constructor(id){
    super(id);
    this.type = 'Square';
    this.vertices.push(new Point([0, 0], [0, 0, 0, 1], 0));
    this.vertices.push(new Point([0, 0], [0, 0, 0, 1], 1));
    this.vertices.push(new Point([0, 0], [0, 0, 0, 1], 2));
    this.vertices.push(new Point([0, 0], [0, 0, 0, 1], 3));
    // this.vertices.push(new Point([0, 0], [0, 0, 0, 1], 4));
    // this.vertices.push(new Point([0, 0], [0, 0, 0, 1], 5));
  }

  moveVertex = (id, coor, moving = false) => {
    // initialize square
    if (!moving){
      this.vertices[id].setCoor(coor);
      this.setCentroid();
      return
    } 

    var dict = {
      0: [3, 1 , 2],
      1: [2, 0 , 3],
      2: [1, 0 , 3],
      3: [0, 1 , 2],
    }

    var L = dist(coor, this.vertices[dict[id][0]].coor) * Math.sin(Math.PI / 4)
  
    var LX = coor[0] - this.vertices[dict[id][0]].coor[0]  < 0 ? L : -L
    var LY = coor[1] - this.vertices[dict[id][0]].coor[1]< 0 ? -L : L
    
    this.vertices[id].coor[0] = this.centroid.coor[0] - LX/2
    this.vertices[id].coor[1] = this.centroid.coor[1] + LY/2

    this.vertices[dict[id][1]].coor[0] = this.vertices[id].coor[0]
    this.vertices[dict[id][1]].coor[1] = this.vertices[dict[id][0]].coor[1]
    this.vertices[dict[id][2]].coor[0] = this.vertices[dict[id][0]].coor[0]
    this.vertices[dict[id][2]].coor[1] = this.vertices[id].coor[1]

    this.setCentroid()
  }

  setAtrributes = (id, vertices, angle, centroid) => {
    this.id = id;

    let count = 0;
    this.vertices.forEach(v => {
      v.coor = vertices[count].coor;
      v.color = vertices[count].color;
      count++;
    });
    this.angle = angle;
    this.centroid.coor = centroid.coor;
    this.centroid.color = centroid.color;
    this.centroid.id = centroid.id;
    this.centroid.isCentroid = centroid.isCentroid;
  }

  getLength = () => {
    return dist(this.vertices[0].coor, this.vertices[1].coor)
  }

  setLength = (length) => {
    // Count Desired Diagonal
    let newLength = Math.sqrt(Math.pow(length, 2) + Math.pow(length, 2));

    // Real Diagonal 1
    let dx1 = this.vertices[3].coor[0] - this.vertices[0].coor[0];
    let dy1 = this.vertices[3].coor[1] - this.vertices[0].coor[1];
    let angle1 = Math.atan2(dy1, dx1);

    let x0 = this.centroid.coor[0] - newLength * Math.cos(angle1)/2;
    let y0 = this.centroid.coor[1] - newLength * Math.sin(angle1)/2;
    let x3 = this.centroid.coor[0] + newLength * Math.cos(angle1)/2;
    let y3 = this.centroid.coor[1] + newLength * Math.sin(angle1)/2;

    // Real Diagonal 2
    let dx2 = this.vertices[2].coor[0] - this.vertices[1].coor[0];
    let dy2 = this.vertices[2].coor[1] - this.vertices[1].coor[1];
    let angle2 = Math.atan2(dy2, dx2);

    let x1 = this.centroid.coor[0] - newLength * Math.cos(angle2)/2;
    let y1 = this.centroid.coor[1] - newLength * Math.sin(angle2)/2;
    let x2 = this.centroid.coor[0] + newLength * Math.cos(angle2)/2;
    let y2 = this.centroid.coor[1] + newLength * Math.sin(angle2)/2;

    this.vertices[0].coor = [x0, y0];
    this.vertices[1].coor = [x1, y1];
    this.vertices[2].coor = [x2, y2];
    this.vertices[3].coor = [x3, y3];

    console.log(`x0: ${this.vertices[0].coor[0]}, y0: ${this.vertices[0].coor[1]}`);
    console.log(`x1: ${this.vertices[1].coor[0]}, y1: ${this.vertices[1].coor[1]}`);
    console.log(`x2: ${this.vertices[2].coor[0]}, y2: ${this.vertices[2].coor[1]}`);
    console.log(`x3: ${this.vertices[3].coor[0]}, y3: ${this.vertices[3].coor[1]}`);
    console.log(this.getLength(), length);
  }

  render = (gl) => {
    const verticesCoor = [];
    const verticesColors = [];

    this.vertices.forEach((v) => {
      verticesCoor.push(v.coor);
      verticesColors.push(v.color);
    });

    const vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesCoor), gl.STATIC_DRAW);
    

    const vPosition = gl.getAttribLocation(program, 'vPosition');
    gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesColors), gl.STATIC_DRAW);

    const vColor = gl.getAttribLocation(program, 'vColor');
    gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vColor);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, verticesCoor.length);

    this.renderDot(gl, vBuffer, vPosition, cBuffer, vColor)
  }
}

class Rectangle extends Model {
    constructor(id){
      super(id);
      this.type = 'Rectangle';
      this.vertices.push(new Point([0, 0], [0, 0, 0, 1], 0));
      this.vertices.push(new Point([0, 0], [0, 0, 0, 1], 1));
      this.vertices.push(new Point([0, 0], [0, 0, 0, 1], 2));
      this.vertices.push(new Point([0, 0], [0, 0, 0, 1], 3));
    }
  
    moveVertex = (id, coor, moving = false) => {
  
      // initialize rectangle
      if (!moving){
        this.vertices[id].setCoor(coor);
        this.setCentroid();
        return
      } 
      
      var dict = {
        0: [3, 1 , 2],
        1: [2, 0 , 3],
        2: [1, 3 , 0],
        3: [0, 2 , 1],
      }
  
      this.vertices[id].setCoor(coor)
      this.vertices[dict[id][1]].coor[0] = coor[0]
      this.vertices[dict[id][1]].coor[1] = this.vertices[dict[id][0]].coor[1]
      this.vertices[dict[id][2]].coor[0] = this.vertices[dict[id][0]].coor[0]
      this.vertices[dict[id][2]].coor[1] = coor[1]
      this.setCentroid()
    }
  
    setAtrributes = (id, vertices, angle, centroid) => {
      this.id = id;
  
      let count = 0;
      this.vertices.forEach(v => {
        v.coor = vertices[count].coor;
        v.color = vertices[count].color;
        count++;
      });
      this.angle = angle;
      this.centroid.coor = centroid.coor;
      this.centroid.color = centroid.color;
      this.centroid.id = centroid.id;
      this.centroid.isCentroid = centroid.isCentroid;
    }
  
    getLength = () => {
      return dist(this.vertices[3].coor, this.vertices[1].coor);
    }
  
    getWidth = () => {
      return dist(this.vertices[3].coor, this.vertices[2].coor);
    }

    setLength = (length) => {

        // New Length 1
        let dx1 = this.vertices[3].coor[0] - this.vertices[1].coor[0];
        let dy1 = this.vertices[3].coor[1] - this.vertices[1].coor[1];
        let angle1 = Math.atan2(dy1, dx1);
    
        let midPoint1 = [(this.vertices[3].coor[0] + this.vertices[1].coor[0]) / 2, (this.vertices[3].coor[1] + this.vertices[1].coor[1]) / 2];
    
        let x1 = midPoint1[0] - length * Math.cos(angle1)/2;
        let y1 = midPoint1[1] - length * Math.sin(angle1)/2;
        let x3 = midPoint1[0] + length * Math.cos(angle1)/2;
        let y3 = midPoint1[1] + length * Math.sin(angle1)/2;
    
        // New Length 2
        let dx2 = this.vertices[2].coor[0] - this.vertices[0].coor[0];
        let dy2 = this.vertices[2].coor[1] - this.vertices[0].coor[1];
        let angle2 = Math.atan2(dy2, dx2);
    
        let midPoint2 = [(this.vertices[2].coor[0] + this.vertices[0].coor[0]) / 2, (this.vertices[2].coor[1] + this.vertices[0].coor[1]) / 2];
    
        let x0 = midPoint2[0] - length * Math.cos(angle2)/2;
        let y0 = midPoint2[1] - length * Math.sin(angle2)/2;
        let x2 = midPoint2[0] + length * Math.cos(angle2)/2;
        let y2 = midPoint2[1] + length * Math.sin(angle2)/2;
    
        this.vertices[0].coor = [x0, y0];
        this.vertices[1].coor = [x1, y1];
        this.vertices[2].coor = [x2, y2];
        this.vertices[3].coor = [x3, y3];
    
        console.log(`x0: ${this.vertices[0].coor[0]}, y0: ${this.vertices[0].coor[1]}`);
        console.log(`x1: ${this.vertices[1].coor[0]}, y1: ${this.vertices[1].coor[1]}`);
        console.log(`x2: ${this.vertices[2].coor[0]}, y2: ${this.vertices[2].coor[1]}`);
        console.log(`x3: ${this.vertices[3].coor[0]}, y3: ${this.vertices[3].coor[1]}`);
        console.log(this.getLength(), length);
    }
    
    setWidth = (width) => {
    
        // New width 1
        let dx1 = this.vertices[3].coor[0] - this.vertices[2].coor[0];
        let dy1 = this.vertices[3].coor[1] - this.vertices[2].coor[1];
        let angle1 = Math.atan2(dy1, dx1);
    
        let midPoint1 = [(this.vertices[3].coor[0] + this.vertices[2].coor[0]) / 2, (this.vertices[3].coor[1] + this.vertices[2].coor[1]) / 2];
    
        let x2 = midPoint1[0] - width * Math.cos(angle1)/2;
        let y2 = midPoint1[1] - width * Math.sin(angle1)/2;
        let x3 = midPoint1[0] + width * Math.cos(angle1)/2;
        let y3 = midPoint1[1] + width * Math.sin(angle1)/2;
    
        // New width 2
        let dx2 = this.vertices[1].coor[0] - this.vertices[0].coor[0];
        let dy2 = this.vertices[1].coor[1] - this.vertices[0].coor[1];
        let angle2 = Math.atan2(dy2, dx2);
    
        let midPoint2 = [(this.vertices[1].coor[0] + this.vertices[0].coor[0]) / 2, (this.vertices[1].coor[1] + this.vertices[0].coor[1]) / 2];
    
        let x0 = midPoint2[0] - width * Math.cos(angle2)/2;
        let y0 = midPoint2[1] - width * Math.sin(angle2)/2;
        let x1 = midPoint2[0] + width * Math.cos(angle2)/2;
        let y1 = midPoint2[1] + width * Math.sin(angle2)/2;
    
        this.vertices[0].coor = [x0, y0];
        this.vertices[1].coor = [x1, y1];
        this.vertices[2].coor = [x2, y2];
        this.vertices[3].coor = [x3, y3];
    
        console.log(`x0: ${this.vertices[0].coor[0]}, y0: ${this.vertices[0].coor[1]}`);
        console.log(`x1: ${this.vertices[1].coor[0]}, y1: ${this.vertices[1].coor[1]}`);
        console.log(`x2: ${this.vertices[2].coor[0]}, y2: ${this.vertices[2].coor[1]}`);
        console.log(`x3: ${this.vertices[3].coor[0]}, y3: ${this.vertices[3].coor[1]}`);
        console.log(this.getWidth(), width);
    }
  
    render = (gl) => {
      const verticesCoor = [];
      const verticesColors = [];
  
      this.vertices.forEach((v) => {
        verticesCoor.push(v.coor);
        verticesColors.push(v.color);
      });
  
      const vBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesCoor), gl.STATIC_DRAW);
      
  
      const vPosition = gl.getAttribLocation(program, 'vPosition');
      gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(vPosition);
      
      var cBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesColors), gl.STATIC_DRAW);
  
      const vColor = gl.getAttribLocation(program, 'vColor');
      gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(vColor);
  
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, verticesCoor.length);
  
      this.renderDot(gl, vBuffer, vPosition, cBuffer, vColor)
    }
  }

class Polygon extends Model {
    constructor(id){
      super(id);
      this.type = 'Polygon';
      this.vertices.push(new Point([0, 0], [0, 0, 0, 1], 0));
    }
  
    setAtrributes = (id, vertices, angle, centroid) => {
      this.id = id;
  
      let count = 0;
      vertices.forEach(v => {
        if (count == 0) {
          this.vertices.coor = v.coor;
          this.vertices.color = v.color;  
        } else {
          this.vertices.push(new Point(v.coor, v.color));
        }
        count++;
      });
  
      this.angle = angle;
      this.centroid.coor = centroid.coor;
      this.centroid.color = centroid.color;
      this.centroid.id = centroid.id;
      this.centroid.isCentroid = centroid.isCentroid;
    }
  
    isFirstVertex = () => {
      return this.vertices.length === 1;
    }
  
    deleteVertex = (id) => {
      this.vertices.splice(id, 1);
      this.setCentroid();
      for (let i = 0; i < this.vertices.length; i++) {
        this.vertices[i].id = i;
      }
    }
  
    render = (gl) => {
      const verticesCoor = [];
      const verticesColors = [];
  
      this.vertices.forEach((v) => {
        verticesCoor.push(v.coor);
        verticesColors.push(v.color);
      });
  
      const vBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesCoor), gl.STATIC_DRAW);
      
  
      const vPosition = gl.getAttribLocation(program, 'vPosition');
      gl.vertexAttribPointer(vPosition, 2, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(vPosition);
      
      var cBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, flatten(verticesColors), gl.STATIC_DRAW);
  
      const vColor = gl.getAttribLocation(program, 'vColor');
      gl.vertexAttribPointer(vColor, 4, gl.FLOAT, false, 0, 0);
      gl.enableVertexAttribArray(vColor);
  
      gl.drawArrays(gl.TRIANGLE_FAN, 0, verticesCoor.length);
  
      this.renderDot(gl, vBuffer, vPosition, cBuffer, vColor)
    }
}