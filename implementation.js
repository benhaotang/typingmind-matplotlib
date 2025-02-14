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
  <script>
  async function main() {
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
    await pyodide.loadPackage("matplotlib");
  
    // Set packages variable (an empty array if none provided)
    const packages = ${JSON.stringify(pkgs)};
  
    // Load additional packages if provided
    if (packages.length > 0) {
      for (const packageName of packages) {
        await pyodide.loadPackage(packageName);
      }
    }
  
    // Run the Python code with the first three lines trimmed
    pyodide.runPython(\`${pythonCode}\`);
  }
  main();
  </script>
  `;
  
    return htmlString;
  }
  