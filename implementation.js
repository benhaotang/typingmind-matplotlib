function render_matplotlib_plot(params) {
  const { title, matplotlib_code, packages } = params;

  // Ensure packages is an array even if it's empty or undefined
  const pkgs = Array.isArray(packages) && packages.length > 0 ? packages : [];

  // Start constructing the HTML string
  let htmlString = `
<script src="https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js"></script>
<script>
async function main() {
  let pyodide = await loadPyodide();

  // Print Python version
  console.log(
    pyodide.runPython(\`
      import sys
      sys.version
    \`)
  );

  // Load matplotlib package
  await pyodide.loadPackage("matplotlib");

  // Set packages (this will be an empty array if no packages were provided)
  const packages = ${JSON.stringify(pkgs)};

  // Load additional packages if provided
  if (packages.length > 0) {
    for (const packageName of packages) {
      await pyodide.loadPackage(packageName);
    }
  }

  // Run matplotlib code
  pyodide.runPython(\`import matplotlib\nmatplotlib.use('module://matplotlib_pyodide.html5_canvas_backend')\n${matplotlib_code}
  \`);
}
main();
</script>
`;

  return htmlString;
}
