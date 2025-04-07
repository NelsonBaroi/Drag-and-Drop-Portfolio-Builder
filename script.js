// script.js

document.addEventListener('DOMContentLoaded', () => {
  const draggableOptions = document.getElementById('draggable-options');
  const workspaceBox = document.getElementById('workspace-box');
  let sections = [];

  // Render sections in the workspace
  function renderSections() {
    workspaceBox.innerHTML = ''; // Clear workspace before rendering
    sections.forEach((section, index) => {
      const div = document.createElement('div');
      div.className = 'section';
      div.dataset.index = index;

      if (section.type === 'introduction') {
        div.innerHTML = `
          <h3>${section.type.charAt(0).toUpperCase() + section.type.slice(1)}</h3>
          <div class="editor" contenteditable="true">${section.content}</div>
          <div class="actions">
            <button class="delete-section" data-index="${index}">Delete</button>
          </div>
        `;
      } else {
        div.innerHTML = `
          <h3>${section.type.charAt(0).toUpperCase() + section.type.slice(1)}</h3>
          ${getFormEditor(section.type)}
          <div class="entries" data-index="${index}">
            ${section.entries.map((entry, entryIndex) => `
              <div class="entry" draggable="true" data-entry-index="${entryIndex}">
                <strong>Entry ${entryIndex + 1}:</strong>
                ${Object.entries(entry)
                  .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
                  .join('')}
                <button class="delete-entry" data-index="${index}" data-entry-index="${entryIndex}">X</button>
              </div>
            `).join('')}
          </div>
          <div class="actions">
            <button class="add-entry" data-index="${index}">Add Entry</button>
            <button class="delete-section" data-index="${index}">Delete Section</button>
          </div>
        `;
      }
      workspaceBox.appendChild(div);

      // Make entries sortable within the section
      const entriesContainer = div.querySelector('.entries');
      if (entriesContainer) {
        new Sortable(entriesContainer, {
          animation: 150,
          onEnd: evt => {
            const oldIndex = evt.oldIndex;
            const newIndex = evt.newIndex;
            if (oldIndex !== null && newIndex !== null) {
              const movedEntry = section.entries.splice(oldIndex, 1)[0];
              section.entries.splice(newIndex, 0, movedEntry);
            }
          }
        });
      }
    });
  }

  // Get pre-designed form editor for specific types
  function getFormEditor(type) {
    switch (type) {
      case 'skills':
        return `
          <div class="form-editor">
            <label for="skill-name-${type}">Skill Name:</label>
            <input type="text" id="skill-name-${type}" placeholder="Skill Name" required />
            <label for="proficiency-level-${type}">Proficiency Level:</label>
            <input type="text" id="proficiency-level-${type}" placeholder="Proficiency Level" required />
          </div>
        `;
      case 'education':
        return `
          <div class="form-editor">
            <label for="institution-${type}">Institution:</label>
            <input type="text" id="institution-${type}" placeholder="Institution" required />
            <label for="degree-${type}">Degree:</label>
            <input type="text" id="degree-${type}" placeholder="Degree" required />
            <label for="year-${type}">Year:</label>
            <input type="text" id="year-${type}" placeholder="Year" required />
          </div>
        `;
      case 'experience':
        return `
          <div class="form-editor">
            <label for="company-${type}">Company:</label>
            <input type="text" id="company-${type}" placeholder="Company" required />
            <label for="role-${type}">Role:</label>
            <input type="text" id="role-${type}" placeholder="Role" required />
            <label for="duration-${type}">Duration:</label>
            <input type="text" id="duration-${type}" placeholder="Duration" required />
          </div>
        `;
      case 'projects':
        return `
          <div class="form-editor">
            <label for="project-name-${type}">Project Name:</label>
            <input type="text" id="project-name-${type}" placeholder="Project Name" required />
            <label for="description-${type}">Description:</label>
            <textarea id="description-${type}" placeholder="Description" required></textarea>
          </div>
        `;
      default:
        return '';
    }
  }

  // Drag-and-Drop Functionality
  new Sortable(draggableOptions, {
    group: { name: 'shared', pull: 'clone', put: false },
    sort: false,
    animation: 150,
  });

  new Sortable(workspaceBox, {
    group: 'shared',
    animation: 150,
    onAdd: evt => {
      const type = evt.item.getAttribute('data-type');

      // Add the new section to the data
      sections.push({ type, content: '', entries: [] });
      evt.item.remove(); // Remove the cloned item from DOM
      renderSections();
    }
  });

  // Handle add entry button clicks
  workspaceBox.addEventListener('click', e => {
    if (e.target.classList.contains('add-entry')) {
      const sectionIndex = e.target.dataset.index;
      const section = sections[sectionIndex];

      // Find the closest form editor
      const formEditor = e.target.closest('.section').querySelector('.form-editor');
      const inputs = formEditor.querySelectorAll('input, textarea');

      // Validate inputs
      let isValid = true;
      inputs.forEach(input => {
        if (!input.value.trim()) {
          isValid = false;
          input.style.borderColor = 'red'; // Highlight empty fields
        } else {
          input.style.borderColor = ''; // Reset border color
        }
      });

      if (!isValid) {
        alert('Please fill out all required fields.');
        return;
      }

      // Create a new entry object
      const entry = {};
      inputs.forEach(input => {
        const label = input.labels?.[0]?.textContent.trim().replace(':', '') || input.placeholder || 'Unnamed Field';
        entry[label] = input.value || ''; // Use empty string if no value
        input.value = ''; // Clear input fields
      });

      console.log('Adding entry:', entry); // Debugging: Log the entry

      // Add the entry to the corresponding section
      section.entries.push(entry);
      renderSections(); // Re-render the workspace
    }
  });

  // Handle delete entry button clicks
  workspaceBox.addEventListener('click', e => {
    if (e.target.classList.contains('delete-entry')) {
      const sectionIndex = e.target.dataset.index;
      const entryIndex = e.target.dataset.entryIndex;
      sections[sectionIndex].entries.splice(entryIndex, 1); // Remove the entry
      renderSections(); // Re-render the workspace
    }
  });

  // Handle delete section button clicks
  workspaceBox.addEventListener('click', e => {
    if (e.target.classList.contains('delete-section')) {
      const sectionIndex = e.target.dataset.index;
      sections.splice(sectionIndex, 1); // Remove the section
      renderSections(); // Re-render the workspace
    }
  });

  // Export as HTML
  document.getElementById('export-html').addEventListener('click', () => {
    const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>My Portfolio</title>
        <style>
          /* Embedded CSS for the exported portfolio */
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 0;
            background: #f9fafb;
            color: #333;
            line-height: 1.6;
          }

          header {
            text-align: center;
            padding: 2rem;
            background: #6200ea;
            color: white;
          }

          header h1 {
            margin: 0;
            font-size: 2.5rem;
          }

          section {
            max-width: 800px;
            margin: 2rem auto;
            padding: 1rem;
            background: white;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }

          section h2 {
            margin-top: 0;
            font-size: 1.8rem;
            color: #6200ea;
          }

          section .entry {
            margin-bottom: 1rem;
            padding: 0.5rem;
            border-left: 4px solid #6200ea;
            background: #f4f4f9;
            border-radius: 4px;
          }

          section .entry p {
            margin: 0.2rem 0;
          }

          footer {
            text-align: center;
            padding: 1rem;
            background: #6200ea;
            color: white;
            margin-top: 2rem;
          }
        </style>
      </head>
      <body>
        <header>
          <h1>My Portfolio</h1>
        </header>

        <!-- Dynamically Generated Content -->
        ${sections.map(section => `
          <section>
            <h2>${section.type.charAt(0).toUpperCase() + section.type.slice(1)}</h2>
            ${
              section.type === 'introduction'
                ? `<div>${section.content}</div>`
                : section.entries.map((entry, entryIndex) => `
                    <div class="entry">
                      <strong>Entry ${entryIndex + 1}:</strong>
                      ${Object.entries(entry)
                        .map(([key, value]) => `<p><strong>${key}:</strong> ${value}</p>`)
                        .join('')}
                    </div>
                  `).join('')
            }
          </section>
        `).join('')}

        <footer>
          <p>&copy; My Portfolio</p>
        </footer>
      </body>
      </html>
    `;

    // Create a downloadable HTML file
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio.html';
    a.click();
  });

  // Export as JSON
  document.getElementById('export-json').addEventListener('click', () => {
    const json = JSON.stringify(sections, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'portfolio.json';
    a.click();
  });

  // Initial render
  renderSections();
});