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
      for (let i = 0; i < Math.min(3, lines.length); i++) {
        lines[i] = lines[i].trimStart();
      }
      return lines.join('\n');
    }
  
    const pythonCode = trimFirstThreeLines(rawPythonCode);
  
    // Start constructing the HTML string
    let htmlString = `
  <script src="https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js"></script>
  <script>
  async function main() {
    let pyodide = await loadPyodide();
  
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
  