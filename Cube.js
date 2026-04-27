// Cube.js 

class Cube {
  constructor() {
    this.type = 'cube';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
  }

  render() {
    var rgba = this.color;

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    // Front face
    gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
    drawTriangle3D([0,0,0, 1,1,0, 1,0,0]);
    drawTriangle3D([0,0,0, 0,1,0, 1,1,0]);

    // Back face
    gl.uniform4f(u_FragColor, rgba[0]*0.9, rgba[1]*0.9, rgba[2]*0.9, rgba[3]);
    drawTriangle3D([0,0,1, 1,0,1, 1,1,1]);
    drawTriangle3D([0,0,1, 1,1,1, 0,1,1]);

    // Top face
    gl.uniform4f(u_FragColor, rgba[0]*0.8, rgba[1]*0.8, rgba[2]*0.8, rgba[3]);
    drawTriangle3D([0,1,0, 1,1,0, 1,1,1]);
    drawTriangle3D([0,1,0, 1,1,1, 0,1,1]);

    // Bottom face
    gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
    drawTriangle3D([0,0,0, 1,0,1, 1,0,0]);
    drawTriangle3D([0,0,0, 0,0,1, 1,0,1]);

    // Right face
    gl.uniform4f(u_FragColor, rgba[0]*0.85, rgba[1]*0.85, rgba[2]*0.85, rgba[3]);
    drawTriangle3D([1,0,0, 1,1,0, 1,1,1]);
    drawTriangle3D([1,0,0, 1,1,1, 1,0,1]);

    // Left face
    gl.uniform4f(u_FragColor, rgba[0]*0.75, rgba[1]*0.75, rgba[2]*0.75, rgba[3]);
    drawTriangle3D([0,0,0, 0,0,1, 0,1,1]);
    drawTriangle3D([0,0,0, 0,1,1, 0,1,0]);
  }
}

// Helper function to draw a single triangle with 3D vertices
var g_vertexBuffer = null;

function drawTriangle3D(vertices) {
  if (g_vertexBuffer == null) {
    g_vertexBuffer = gl.createBuffer();
    if (!g_vertexBuffer) {
      console.log('Failed to create the buffer object');
      return;
    }
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, g_vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
  gl.enableVertexAttribArray(a_Position);
  gl.drawArrays(gl.TRIANGLES, 0, 3);
}