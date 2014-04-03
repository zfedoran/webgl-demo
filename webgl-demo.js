/**
*   WebGLDemo Class
*
*   @constructor 
*/
var WebGLDemo = function(count) {
    this.initialEntityCount = count;

    this.initCanvas();
    this.initContext();

    this.initGeometry();
    this.initShaders();

    this.initUniforms();
    this.initAttributes();

    this.initCamera();
    this.initScene();

    this.initRenderLoop();
};

WebGLDemo.prototype = {
    constructor: WebGLDemo,

    /**
    *   Create and append a canvas element to the document body
    *
    *   @method initCanvas
    *   @returns {undefined}
    */
    initCanvas: function() {
        this.canvas = document.createElement('canvas');
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;

        document.body.appendChild(this.canvas);
    },

    /**
    *   Initialize the WebGL context and set the rendering viewport to be the
    *   same size and location as the canvas.
    *
    *   @method initContext
    *   @returns {undefined}
    */
    initContext: function() {
        window.gl = this.canvas.getContext('webgl', { antialias: false }) 
                 || this.canvas.getContext('experimental-webgl', { antialias: false });

        gl.cullFace(gl.BACK);
        gl.enable(gl.CULL_FACE);

        gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    },

    /**
    *   Create our model geometry and send it to the GPU
    *
    *   @method initGeometry
    *   @returns {undefined}
    */
    initGeometry: function() {
        this.vertexData = new Float32Array([
            // Front face
            -1.0, -1.0,  1.0,    0.0,  0.0,  1.0,
             1.0, -1.0,  1.0,    0.0,  0.0,  1.0,
             1.0,  1.0,  1.0,    0.0,  0.0,  1.0,
            -1.0,  1.0,  1.0,    0.0,  0.0,  1.0,
                                  
            // Back face          
            -1.0, -1.0, -1.0,    0.0,  0.0, -1.0,
            -1.0,  1.0, -1.0,    0.0,  0.0, -1.0,
             1.0,  1.0, -1.0,    0.0,  0.0, -1.0,
             1.0, -1.0, -1.0,    0.0,  0.0, -1.0,
                                    
            // Top face             
            -1.0,  1.0, -1.0,    0.0,  1.0,  0.0,
            -1.0,  1.0,  1.0,    0.0,  1.0,  0.0,
             1.0,  1.0,  1.0,    0.0,  1.0,  0.0,
             1.0,  1.0, -1.0,    0.0,  1.0,  0.0,
                                   
            // Bottom face         
            -1.0, -1.0, -1.0,    0.0, -1.0,  0.0,
             1.0, -1.0, -1.0,    0.0, -1.0,  0.0,
             1.0, -1.0,  1.0,    0.0, -1.0,  0.0,
            -1.0, -1.0,  1.0,    0.0, -1.0,  0.0,
                                   
            // Right face          
             1.0, -1.0, -1.0,    1.0,  0.0,  0.0,
             1.0,  1.0, -1.0,    1.0,  0.0,  0.0,
             1.0,  1.0,  1.0,    1.0,  0.0,  0.0,
             1.0, -1.0,  1.0,    1.0,  0.0,  0.0,
                                    
            // Left face            
            -1.0, -1.0, -1.0,   -1.0,  0.0,  0.0,
            -1.0, -1.0,  1.0,   -1.0,  0.0,  0.0,
            -1.0,  1.0,  1.0,   -1.0,  0.0,  0.0,
            -1.0,  1.0, -1.0,   -1.0,  0.0,  0.0,
        ]);

        this.indexData = new Uint16Array([
            0,  1,  2,      0,  2,  3,    // front
            4,  5,  6,      4,  6,  7,    // back
            8,  9,  10,     8,  10, 11,   // top
            12, 13, 14,     12, 14, 15,   // bottom
            16, 17, 18,     16, 18, 19,   // right
            20, 21, 22,     20, 22, 23    // left
        ]);

        // Send our model data to the GPU
        this.vertexBuffer = gl.createBuffer();
        this.indexBuffer = gl.createBuffer();

        // Vertex buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, this.vertexData, gl.STATIC_DRAW);

        // Index buffer
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this.indexData, gl.STATIC_DRAW);
    },

    /**
    *   Create our vertex and fragment shaders
    *
    *   @method initShaders
    *   @returns {undefined}
    */
    initShaders: function() {
        var vs_source = [
          'attribute vec3 aVertexPosition;',
          'attribute vec3 aVertexNormal;',

          'uniform mat4 uMMatrix;',
          'uniform mat4 uVMatrix;',
          'uniform mat4 uPMatrix;',
          'uniform mat4 uNMatrix;',
          'uniform vec3 uColor;',

          'varying lowp vec3 vColor;',

          'void main(void) {',

          'vec3 lightDirection = normalize(vec3(0, 20, 20));',
          'float lightWeight = max(dot(mat3(uNMatrix) * aVertexNormal, lightDirection), 0.0);',
          'vColor = clamp(uColor * 0.5 + lightWeight * vec3(0.5, 0.5, 0.5), 0.0, 1.0);',

          '  gl_Position = uPMatrix *',
          '                uVMatrix *',
          '                uMMatrix *',
          '                vec4(aVertexPosition, 1.0);',

          '}',
        ].join('');

        var fs_source = [
          'varying lowp vec3 vColor;',

          'void main(void) {',
          '  gl_FragColor = vec4(vColor, 1.0);',
          '}'
        ].join('');
        
        // Create the native shader objects
        this.fs_shader = gl.createShader(gl.FRAGMENT_SHADER);
        this.vs_shader = gl.createShader(gl.VERTEX_SHADER);

        // Compile the Fragment Shader
        gl.shaderSource(this.fs_shader, fs_source);
        gl.compileShader(this.fs_shader);

        // Check for compile errors
        if (!gl.getShaderParameter(this.fs_shader, gl.COMPILE_STATUS)) {  
            throw "An error occurred compiling the shaders: " + gl.getShaderInfoLog(this.fs_shader);
        }

        // Compile the Vertex Shader
        gl.shaderSource(this.vs_shader, vs_source);
        gl.compileShader(this.vs_shader);

        // Check for compile errors
        if (!gl.getShaderParameter(this.vs_shader, gl.COMPILE_STATUS)) {  
            throw "An error occurred compiling the shaders: " + gl.getShaderInfoLog(this.vs_shader);
        }

        // Create a shader program and bind the shaders to it
        this.shaderProgram = gl.createProgram();

        gl.attachShader(this.shaderProgram, this.vs_shader);
        gl.attachShader(this.shaderProgram, this.fs_shader);
        gl.linkProgram(this.shaderProgram);

        // Tell the context we want to use this program when drawing primitives
        gl.useProgram(this.shaderProgram);
    },

    /**
    *   Get pointers to our uniforms from our shaders
    *
    *   @method initUniforms
    *   @returns {undefined}
    */
    initUniforms: function() {
        // Get pointer locations to our shader uniforms
        this.uPMatrixLoc = gl.getUniformLocation(this.shaderProgram, 'uPMatrix');
        this.uVMatrixLoc = gl.getUniformLocation(this.shaderProgram, 'uVMatrix');
        this.uMMatrixLoc = gl.getUniformLocation(this.shaderProgram, 'uMMatrix');
        this.uNMatrixLoc = gl.getUniformLocation(this.shaderProgram, 'uNMatrix');
        this.uColorLoc   = gl.getUniformLocation(this.shaderProgram, 'uColor');
    },

    /**
    *   Tell the GPU how our vertex data is structured
    *
    *   @method initAttributes
    *   @returns {undefined}
    */
    initAttributes: function() {
        // Get attribute locations
        this.posAttrLoc    = gl.getAttribLocation(this.shaderProgram, 'aVertexPosition');
        this.normalAttrLoc = gl.getAttribLocation(this.shaderProgram, 'aVertexNormal');

        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

        var VECTOR3_SIZE = 3 * 4;
        var MATRIX4_SIZE = 16 * 4;

        var stride = VECTOR3_SIZE * 2;

        gl.enableVertexAttribArray(this.posAttrLoc);
        gl.vertexAttribPointer(this.posAttrLoc, 3, gl.FLOAT, false, stride, 0 * VECTOR3_SIZE);

        gl.enableVertexAttribArray(this.normalAttrLoc);
        gl.vertexAttribPointer(this.normalAttrLoc, 3, gl.FLOAT, false, stride, 1 * VECTOR3_SIZE);
    },

    /**
    *   Initialize a camera that will render our scene
    *   (Note: There is no Camera object, objects are moved into view through
    *   matrix transformations)
    *
    *   @method initCamera
    *   @returns {undefined}
    */
    initCamera: function() {
        this.aspect = this.canvas.width / this.canvas.height;
        this.fov    = 70;
        this.near   = 0.1;
        this.far    = 1000;

        this.position = new Vector3(0, 30, 30);
        this.target   = new Vector3(0, 0, 0);
        this.up       = new Vector3(0, 1, 0);

        this.viewMatrix  = new Matrix4();
        this.projMatrix  = new Matrix4();
    },

    /**
    *   Create our demo scene
    *
    *   @method initScene
    *   @returns {undefined}
    */
    initScene: function() {
        this.scene = [];

        var i, len = this.initialEntityCount;
        for (var i = 0; i < len; i++) {
            this.addEntity();
        }
    },

    /**
    *   Add an entity to the scene
    *
    *   @method addEntity
    *   @returns {undefined}
    */
    addEntity: function() {
        var entity = {
            position        : this.getRandomVector(-10, 10),
            scale           : this.getRandomVector(1, 3),
            rotation        : this.getRandomVector(-4, 4),
            angularVelocity : this.getRandomVector(-0.3, 0.3),
            velocity        : this.getRandomVector(-1, 1),
            color           : this.getRandomVector(0, 1),
            matrix          : new Matrix4()
        };
        
        this.scene.push(entity);
    },

    /**
    *   Get a random Vector3 with the provided min and max values
    *
    *   @method getRandomVector
    *   @param {min}
    *   @param {max}
    *   @returns {Vector3}
    */
    getRandomVector: function(min, max) {
        var delta = max - min;
        return new Vector3((Math.random() * delta) + min,
                           (Math.random() * delta) + min,
                           (Math.random() * delta) + min);
    },

    /**
    *   Initialize the render loop
    *
    *   @method initRenderLoop
    *   @returns {undefined}
    */
    initRenderLoop: function() {
        var self = this;
        var prevTime = 0;
        var elapsedList = [];
        (function loop(time) {
            window.requestAnimationFrame(loop);

            // Calculate the FPS
            var elapsed = time - prevTime;
            elapsedList.push(elapsed);

            if (elapsedList.length >= 60) {
                var i, avg = 0;
                for (i = 0; i<elapsedList.length; i++) {
                    avg += elapsedList[i];
                }
                console.log('fps: ' + (1000 / (avg / 60)));
                elapsedList.length = 0;
            }

            // Set the total elapsed time
            self.time = time;

            // Call our update and render functions
            self.update(elapsed);
            self.render(elapsed);

            prevTime = time;
        })(0);
    },

    /**
    *   This method runs update logic each frame
    *
    *   @method update
    *   @param {elapsed}
    *   @returns {undefined}
    */
    update: function(elapsed) {
        this.updateCamera(elapsed);
        this.updateScene(elapsed);
    },

    /**
    *   Update the view and projection matrices (our camera)
    *
    *   @method updateCamera
    *   @param {elapsed}
    *   @returns {undefined}
    */
    updateCamera: function(elapsed) {
        var delta =  this.time * 0.0001;

        this.position.x = Math.sin(delta) * 50;
        this.position.y = Math.sin(-delta/2) * 5 ;
        this.position.z = Math.cos(delta/3) * 50;

        // Update View matrix
        Matrix4.createLookAt(this.position, 
                             this.target, 
                             this.up, 
                     /*out*/ this.viewMatrix);

        // Update Projection matrix
        Matrix4.createPerspective(this.fov, 
                                  this.aspect, 
                                  this.near, 
                                  this.far, 
                          /*out*/ this.projMatrix);
    },

    /**
    *   Update all of our scene objects
    *
    *   @method updateScene
    *   @param {elapsed}
    *   @returns {undefined}
    */
    updateScene: function(elapsed) {
        // Update Scene
        var entity, i, len = this.scene.length;
        for (var i = 0; i < len; i++) {
            entity = this.scene[i];

            // Reduce the velocity over time
            Vector3.multiplyScalar(entity.velocity, 0.99, /*out*/ entity.velocity);

            // Reduce the angular velocity over time
            Vector3.multiplyScalar(entity.angularVelocity, 0.99, /*out*/ entity.angularVelocity);

            // Update the position based on the velocity
            Vector3.add(entity.position, entity.velocity, /*out*/ entity.position);

            // Update the rotation based on the angular velocity
            Vector3.add(entity.rotation, entity.angularVelocity, /*out*/ entity.rotation);

            // Put all of our transforms into a transformation matrix
            entity.matrix.compose(entity.position, 
                                  entity.rotation, 
                                  entity.scale);
        }
    },

    /**
    *   This method applies the current render state and renders the scene
    *
    *   @method render
    *   @param {elapsed}
    *   @returns {undefined}
    */
    render: function(elapsed) {
        this.applyRenderState();
        this.renderScene();
    },

    /**
    *   This method applies the render state
    *
    *   @method applyRenderState
    *   @returns {undefined}
    */
    applyRenderState: function() {
        // Clear the screen
        gl.clearColor(0.22, 0.22, 0.22, 1.0);             // Set clear color to black, fully opaque
        gl.enable(gl.DEPTH_TEST);                         // Enable depth testing
        gl.depthFunc(gl.LEQUAL);                          // Near things obscure far things
        gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);// Clear the color as well as the depth buffer.

        // Set vertex & index buffers
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        gl.useProgram(this.shaderProgram);

        // Send matrix data to the GPU
        gl.uniformMatrix4fv(this.uPMatrixLoc, false, this.projMatrix.elements); 
        gl.uniformMatrix4fv(this.uVMatrixLoc, false, this.viewMatrix.elements); 
    },

    /**
    *   This method asks the GPU to render our scene entities
    *
    *   @method renderScene
    *   @returns {undefined}
    */
    renderScene: function() {
        var entity, i, len = this.scene.length;
        for (var i = 0; i < len; i++) {
            entity = this.scene[i];
            this.renderEntity(entity);
        }
    },

    /**
    *   This method renders the given scene entity
    *
    *   @method renderEntity
    *   @param {entity}
    *   @returns {undefined}
    */
    renderEntity: function(entity) {
        // Send matrix data to the GPU
        gl.uniformMatrix4fv(this.uMMatrixLoc, false, entity.matrix.elements); 

        // Calculate the normal matrix required for lighting
        var normalMatrix = Matrix4.inverse(entity.matrix);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(this.uNMatrixLoc, false, normalMatrix.elements); 

        // Set the color of this entity
        gl.uniform3f(this.uColorLoc, entity.color.x, entity.color.y, entity.color.z); 

        // Tell the GPU to draw our primitives
        gl.drawElements(gl.TRIANGLES, this.indexData.length, gl.UNSIGNED_SHORT, 0);
    }
};
