// Cone.js

class Cone {
  constructor() {
    this.type = 'cone';
    this.color = [1.0, 1.0, 1.0, 1.0];
    this.matrix = new Matrix4();
    this.segments = 8;
  }

  render() {
    var rgba = this.color;

    gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

    var angleStep = 360 / this.segments;

    // Side triangles from tip to base circle
    for (var angle = 0; angle < 360; angle += angleStep) {
      var a1 = angle * Math.PI / 180;
      var a2 = (angle + angleStep) * Math.PI / 180;

      var x1 = Math.cos(a1) * 0.5 + 0.5;
      var z1 = Math.sin(a1) * 0.5 + 0.5;
      var x2 = Math.cos(a2) * 0.5 + 0.5;
      var z2 = Math.sin(a2) * 0.5 + 0.5;

      // Shade varies per segment for depth
      var shade = 0.85 + 0.15 * Math.cos(a1);
      gl.uniform4f(u_FragColor, rgba[0]*shade, rgba[1]*shade, rgba[2]*shade, rgba[3]);
      drawTriangle3D([0.5, 1.0, 0.5,  x1, 0.0, z1,  x2, 0.0, z2]);
    }

    // Base circle
    gl.uniform4f(u_FragColor, rgba[0]*0.7, rgba[1]*0.7, rgba[2]*0.7, rgba[3]);
    for (var angle = 0; angle < 360; angle += angleStep) {
      var a1 = angle * Math.PI / 180;
      var a2 = (angle + angleStep) * Math.PI / 180;

      var x1 = Math.cos(a1) * 0.5 + 0.5;
      var z1 = Math.sin(a1) * 0.5 + 0.5;
      var x2 = Math.cos(a2) * 0.5 + 0.5;
      var z2 = Math.sin(a2) * 0.5 + 0.5;

      drawTriangle3D([0.5, 0.0, 0.5,  x1, 0.0, z1,  x2, 0.0, z2]);
    }
  }
}