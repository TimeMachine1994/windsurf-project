<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Component Test Page</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            margin: 0;
            padding: 2rem;
            background-color: #f4f4f9;
            color: #333;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
        }
        h1, h2 {
            color: #2c3e50;
            border-bottom: 2px solid #ddd;
            padding-bottom: 0.5rem;
            margin-top: 2rem;
        }
        .component-section {
            background-color: #fff;
            padding: 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            margin-bottom: 1.5rem;
        }
        /* Style for individual component displays */
        .component-demo {
            display: flex;
            flex-wrap: wrap;
            gap: 1.5rem;
            align-items: center;
            padding: 1rem 0;
            border-bottom: 1px dashed #eee;
        }
        .component-demo:last-child {
            border-bottom: none;
        }
        .component-label {
            font-weight: bold;
            width: 150px;
            flex-shrink: 0;
        }
        
        /* Minimalist Component Styling */
        /* Buttons */
        button {
            padding: 0.5rem 1rem;
            border: 1px solid #ccc;
            border-radius: 4px;
            background-color: #f0f0f0;
            cursor: pointer;
        }
        button:hover {
            background-color: #e0e0e0;
        }
        /* Inputs */
        input[type="text"], input[type="password"], input[type="email"], textarea, select {
            padding: 0.5rem;
            border: 1px solid #ccc;
            border-radius: 4px;
        }
        /* Checkbox & Radio */
        input[type="checkbox"], input[type="radio"] {
            margin-right: 0.5rem;
        }
        /* Navbar */
        .navbar {
            background-color: #34495e;
            padding: 0.5rem;
            border-radius: 4px;
            display: flex;
            gap: 1rem;
        }
        .navbar a {
            color: white;
            text-decoration: none;
            padding: 0.5rem;
        }
        /* Progress Bar */
        .progress-bar-container {
            width: 200px;
            height: 10px;
            background-color: #e0e0e0;
            border-radius: 5px;
            overflow: hidden;
        }
        .progress-bar {
            height: 100%;
            width: 50%; /* Example progress */
            background-color: #2ecc71;
        }
        /* Card */
        .card {
            border: 1px solid #ccc;
            border-radius: 8px;
            padding: 1rem;
            width: 250px;
        }
    </style>
</head>
<body>

    <div class="container">
        <h1>Component Library Showcase</h1>
        <p>A simple page to display and test various web components with minimal styling.</p>

        <div class="component-section">
            <h2>1. Basic Inputs & Controls</h2>
            
            <div class="component-demo">
                <span class="component-label">Button</span>
                <button>Click Me</button>
                <button disabled>Disabled</button>
            </div>

            <div class="component-demo">
                <span class="component-label">Text Input</span>
                <input type="text" placeholder="Enter text here">
            </div>

            <div class="component-demo">
                <span class="component-label">Textarea</span>
                <textarea rows="3" placeholder="Enter a longer message"></textarea>
            </div>

            <div class="component-demo">
                <span class="component-label">Checkbox</span>
                <label><input type="checkbox"> Option 1</label>
                <label><input type="checkbox" checked> Option 2</label>
            </div>
            
            <div class="component-demo">
                <span class="component-label">Radio Button</span>
                <label><input type="radio" name="radio-group"> Choice A</label>
                <label><input type="radio" name="radio-group" checked> Choice B</label>
            </div>
            
            <div class="component-demo">
                <span class="component-label">Dropdown</span>
                <select>
                    <option>Option 1</option>
                    <option>Option 2</option>
                </select>
            </div>

            <div class="component-demo">
                <span class="component-label">Toggle Switch</span>
                <label style="display: flex; align-items: center; cursor: pointer;">
                  <span style="font-size: 14px; margin-right: 10px;">Off</span>
                  <div style="width: 40px; height: 20px; background-color: #ccc; border-radius: 10px; position: relative;">
                    <div style="position: absolute; left: 2px; top: 2px; width: 16px; height: 16px; background-color: white; border-radius: 50%;"></div>
                  </div>
                </label>
            </div>

        </div>

        <div class="component-section">
            <h2>2. Navigation & Layout</h2>

            <div class="component-demo" style="display: block;">
                <span class="component-label" style="display: block; margin-bottom: 0.5rem;">Navbar</span>
                <nav class="navbar">
                    <a href="#">Home</a>
                    <a href="#">About</a>
                    <a href="#">Services</a>
                </nav>
            </div>

            <div class="component-demo">
                <span class="component-label">Breadcrumbs</span>
                <span>Home > Category > Page</span>
            </div>

            <div class="component-demo">
                <span class="component-label">Pagination</span>
                <span><button>&lt;</button> <button>1</button> <button>2</button> <button>3</button> <button>&gt;</button></span>
            </div>

            <div class="component-demo">
                <span class="component-label">Tab System</span>
                <div style="border-bottom: 1px solid #ccc; width: 100%;">
                    <button style="border: none; background: #fff; border-bottom: 2px solid #2c3e50; border-radius: 0;">Tab 1</button>
                    <button style="border: none; background: #fff;">Tab 2</button>
                </div>
            </div>

            <div class="component-demo">
                <span class="component-label">Accordion</span>
                <div style="width: 100%;">
                    <details style="border: 1px solid #ccc; padding: 0.5rem; border-radius: 4px;">
                        <summary>Click to toggle content</summary>
                        <p style="margin-top: 0.5rem; font-size: 0.9em;">This is the hidden content in the accordion panel.</p>
                    </details>
                </div>
            </div>

            <div class="component-demo">
                <span class="component-label">Card</span>
                <div class="card">
                    <h3>Card Title</h3>
                    <p>This is a simple card component to display content.</p>
                </div>
            </div>
            
        </div>

        <div class="component-section">
            <h2>3. Data & Content Display</h2>
            
            <div class="component-demo">
                <span class="component-label">Progress Bar</span>
                <div class="progress-bar-container">
                    <div class="progress-bar"></div>
                </div>
            </div>

            <div class="component-demo">
                <span class="component-label">Alert</span>
                <div style="background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb; padding: 1rem; border-radius: 4px;">
                    This is a success alert message.
                </div>
            </div>

            <div class="component-demo">
                <span class="component-label">Badge</span>
                <span style="background-color: #2ecc71; color: white; padding: 0.25rem 0.5rem; border-radius: 12px; font-size: 0.8em;">New</span>
            </div>
            
            <div class="component-demo">
                <span class="component-label">Data Table</span>
                <table style="width: 100%; border-collapse: collapse;">
                    <thead>
                        <tr style="background-color: #f2f2f2;">
                            <th style="padding: 8px; border: 1px solid #ddd;">Header 1</th>
                            <th style="padding: 8px; border: 1px solid #ddd;">Header 2</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td style="padding: 8px; border: 1px solid #ddd;">Data A</td>
                            <td style="padding: 8px; border: 1px solid #ddd;">Data B</td>
                        </tr>
                    </tbody>
                </table>
            </div>

        </div>

    </div>

</body>
</html>
