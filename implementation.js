function render_matplotlib_plot(params) {
    const { title, matplotlib_code, packages } = params;
  
    // Ensure packages is an array even if empty or undefined
    const pkgs = Array.isArray(packages) && packages.length > 0 ? packages : [];
  
    // Construct the raw Python code as a string
    const rawPythonCode = `
        import matplotlib
        matplotlib.use('module://matplotlib_pyodide.html5_canvas_backend')
        ${matplotlib_code}
    `;
  
    // Function to trim the leading whitespace of the first three lines only
    function trimFirstThreeLines(code) {
      const lines = code.split('\n');
      for (let i = 0; i < Math.min(4, lines.length); i++) {
        lines[i] = lines[i].trimStart();
      }
      return lines.join('\n');
    }
  
    const pythonCode = trimFirstThreeLines(rawPythonCode);
  
    // Start constructing the HTML string
    let htmlString = `
  <div id="plot-container">
      <div
          id="loading-animation"
          style="
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              height: 200px;
          "
      >
          <div class="spinner"></div>
          <p id="loading-caption" style="margin-top: 10px">Loading Pyodide...</p>
      </div>
      <div id="plot-output" style="display: none"></div>
  </div>
  <style>
      .spinner {
          border: 5px solid #f3f3f3;
          border-top: 5px solid #3498db;
          border-radius: 50%;
          width: 50px;
          height: 50px;
          animation: spin 2s linear infinite;
      }
      @keyframes spin {
          0% {
              transform: rotate(0deg);
          }
          100% {
              transform: rotate(360deg);
          }
      }
  </style>
  <script>
  async function main() {
    const loadingCaption=document.getElementById("loading-caption");
    async function _loadScript(url) {
    if (!window.loadedScripts) {
      window.loadedScripts = {};
    }

    if (window.loadedScripts[url]) {
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    }).then(() => (window.loadedScripts[url] = true));
  }

  // Load Pyodide if it's not already loaded
  await _loadScript("https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js");

  // Initialize Pyodide
  loadingCaption.innerText="Initializing Pyodide...";
  let pyodide;
  if (!window.pyodide) {
    pyodide = await loadPyodide();
    window.pyodide = pyodide; // Cache it globally for future use
  } else {
    pyodide = window.pyodide;
  }
  
    // Print Python version for debugging
    console.log(
      pyodide.runPython(\`
        import sys
        sys.version
      \`)
    );
  
    // Load matplotlib package
    loadingCaption.innerText="Loading Matplotlib...";
    await pyodide.loadPackage("matplotlib");
  
    // Set packages variable (an empty array if none provided)
    const packages = ${JSON.stringify(pkgs)};
    // Load additional packages if provided
    if (packages.length > 0) {
      loadingCaption.innerText="Loading additional packages...";
      await Promise.all(packages.map(packageName=>pyodide.loadPackage(packageName))).then(()=>{
      loadingCaption.innerText="Running Python code...";
      });
    }
    else
    {
      loadingCaption.innerText="Running Python code...";
    }
      // Run the Python code with the first three lines trimmed
    try{
      await pyodide.runPython(\`${pythonCode}\`);
    }
    catch(error){
      console.error("Error running Python code:",error);
      document.getElementById("loading-animation").style.display="none";
      document.getElementById("plot-output").innerText="Error generating plot. See console for details.";
      document.getElementById("plot-output").style.display="block";
      return;
    }
    document.getElementById("loading-animation").style.display="none";
    document.getElementById("plot-output").style.display="block";
  }
  main();
  </script>
  `;
  
    return htmlString;
  }
  
