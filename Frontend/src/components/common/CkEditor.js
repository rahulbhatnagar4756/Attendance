import React, { useState, useEffect, useRef } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

function CkEditor({ values, setValues, setMessage, type, inputFields = [], inputFields1 = [], userId = [] }) {
  const [matchedUsers, setMatchedUsers] = useState([]);
  const [originalUsers, setOriginalUsers] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const editorRef = useRef(null);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null); // Reference for the input field

  // Close dropdown when mouse click either outside body or inside of CKEditor body
  useEffect(() => {
    const handleClickOutside = (event) => {
      const editorElement =
        editorRef.current?.ui?.view?.editable?.element || null;

      // Close dropdown if click is outside both CKEditor and dropdown
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        editorElement &&
        !editorElement.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    const handleEditorClick = (event) => {
      // Close dropdown when clicking inside CKEditor body (except if clicking on dropdown itself)
      if (showDropdown && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    const editorElement =
      editorRef.current?.ui?.view?.editable?.element || null;

    if (editorElement) {
      editorElement.addEventListener("mousedown", handleEditorClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);

      if (editorElement) {
        editorElement.removeEventListener("mousedown", handleEditorClick);
      }
    };
  }, [showDropdown]);

  // Prevents reopening on backspace to '@'
  useEffect(() => {
    const handleKeyDown = (event) => {
      // Ensure userId is populated before handling '@'
      if (userId.length > 0) {
        // Check if the event target is the filter input field inside the dropdown
        const isInsideDropdownInput =
          dropdownRef.current?.contains(event.target) &&
          event.target.tagName === 'INPUT';

        if (isInsideDropdownInput) {
          return; // Do not close dropdown or handle '@' while typing in the filter input
        }
        // const isInsideDropdownInput =
        //   dropdownRef.current?.contains(event.target) &&
        //   event.target.tagName === 'INPUT';

        // if (isInsideDropdownInput) {
        //   if (event.key === 'ArrowDown') {
        //     setHighlightedIndex((prev) => Math.min(prev + 1, matchedUsers.length - 1));
        //   } else if (event.key === 'ArrowUp') {
        //     setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        //   } else {
        //     return; // Do not close dropdown or handle '@' while typing in the filter input
        //   }
        // }
        if (event.key === '@') {
          updateMatchedUsers(); // Execute the logic to update matched users based on '@' symbol
          setTimeout(() => {
            const inputElement = dropdownRef.current?.querySelector('input');
            if (inputElement) {
              inputElement.focus(); // Focus the input field
              inputElement.value = ''; // Ensure the input is empty
            }
          }, 0); // Delay ensures the input is ready to be focused
          // } else if (event.key === 'Backspace' && !showDropdown) {
        } else if (event.key === 'Backspace') {
          const editorElement = editorRef.current?.ui?.view?.editable?.element;
          if (editorElement) {
            const plainText = stripHtmlTags(editorRef.current.getData());
            const atIndex = plainText.lastIndexOf('@');

            // Always close the dropdown when backspace is pressed
            setShowDropdown(false);

            // Do not reopen dropdown even if characters after '@' match
            if (atIndex !== -1 && plainText.slice(atIndex + 1) !== '') {
              return;
            }
          }
        } else if (event.key === ' ') {
          // Close dropdown on space if dropdown is open
          if (showDropdown) {
            setShowDropdown(false);
          }
        }
        // else if (event.key === 'ArrowDown') {
        //   setHighlightedIndex((prev) => Math.min(prev + 1, matchedUsers.length - 1));
        // } else if (event.key === 'ArrowUp') {
        //   setHighlightedIndex((prev) => Math.max(prev - 1, 0));
        // }else if (event.key === 'Enter') {
        //   handleUserSelect(matchedUsers[highlightedIndex]);
        // }
      }
    };

    // Add the keydown event listener if userId is populated
    if (userId.length > 0) {
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [userId, inputFields, showDropdown, highlightedIndex]); // This useEffect will re-run whenever userId changes

  const customDecode = (html) => {
    // const decodedHtml = html.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    const decodedHtml = html.replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    return decodedHtml;
  };

  function stripHtmlTags(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || '';
  }

  // Update matched users based on @query
  const updateMatchedUsers = () => {
    const combinedUsers = [...inputFields, ...inputFields1];
    const filteredUsers = userId.filter((user) =>
      combinedUsers.some((combinedUser) => combinedUser === user.value)
      // && user.label.toLowerCase().includes(query)
    );
    setMatchedUsers(filteredUsers);
    setOriginalUsers(filteredUsers);
    setShowDropdown(filteredUsers.length > 0);
    setHighlightedIndex(0);
  };

  const handlePasteAndExitHyperlink = (editor) => {
    if (!editor || !editor.commands) return;

    editor.editing.view.document.on('clipboardInput', (event, data) => {
      let pastedContent = data.dataTransfer.getData('text/plain');
      const urlRegex = /(?:https?:\/\/|www\.)[^\s]+/g;

      if (pastedContent.match(urlRegex)) {
        event.stop(); // Stop default paste behavior

        // If the pasted content starts with 'www.', prepend 'http://'
        if (pastedContent.startsWith('www.')) {
          pastedContent = `http://${pastedContent}`;
        }

        editor.model.change((writer) => {
          const selection = editor.model.document.selection;
          const position = selection.getFirstPosition();

          // Insert "Review Link" as text with a hyperlink
          writer.insertText('Review Link', { linkHref: pastedContent }, position);

          // Move the cursor outside the hyperlink
          const newPosition = position.getShiftedBy('Review Link'.length);
          writer.setSelection(newPosition);

          // Explicitly remove the hyperlink attribute for the cursor's position
          writer.removeSelectionAttribute('linkHref');
        });
      }
    });
  };

  const overrideToolbarLinkCommand = (editor) => {
    if (!editor || !editor.commands) {
      return;
    }
    const linkCommand = editor.commands.get('link');

    linkCommand.on('execute', (event, args) => {
      const linkUrl = args[0]; // The link URL provided in the modal

      if (linkUrl) {
        event.stop(); // Stop the default execution

        editor.model.change((writer) => {
          const selection = editor.model.document.selection;
          const range = selection.getFirstRange();

          if (range) {
            const position = range.end;

            // Check if the URL already exists at the position
            const nodeBefore = position.nodeBefore;
            const nodeAfter = position.nodeAfter;

            if (
              nodeBefore &&
              nodeBefore.is('text') &&
              nodeBefore.data.includes(linkUrl)
            ) {
              return; // Skip if URL already exists
            }

            // Insert the URL only if it doesn't already exist
            writer.insertText(linkUrl, { linkHref: linkUrl }, position);

            // Move the cursor immediately after the hyperlink
            const newPosition = position.getShiftedBy(linkUrl.length);
            writer.setSelection(newPosition);

            // Remove hyperlink attributes for the cursor
            writer.removeSelectionAttribute('linkHref');
          }
        });
      }
    });
  };

  const handleUserSelect = (user) => {
    const newSelectedUsers = [user];
    updateEditorContent(newSelectedUsers);
  };

  // const updateEditorContent = (userArray) => {
  //   if (!editorRef.current) return;

  //   // Extract the user object from the array
  //   const user = userArray[0]; 
  //   if (!user || !user.label) {
  //     console.error("Invalid user data:", userArray);
  //     return;
  //   }

  //   const editor = editorRef.current;
  //   const selection = editor.model.document.selection;
  //   const range = selection.getFirstRange();

  //   editor.model.change((writer) => {
  //     const position = range.end;

  //     // Insert the user's label at the cursor position
  //     writer.insertText(`${user.label} `, position);

  //     // Move the cursor after the inserted text
  //     const newPosition = position.getShiftedBy(user.label.length + 1);
  //     writer.setSelection(newPosition);
  //   });

  //   setShowDropdown(false);
  //   setMatchedUsers([]);
  // };

  const updateEditorContent = (userArray) => {
    if (!editorRef.current) return;

    // Extract the user object from the array
    const user = userArray[0];
    if (!user || !user.label) {
      console.error("Invalid user data:", userArray);
      return;
    }

    const editor = editorRef.current;
    const selection = editor.model.document.selection;
    const range = selection.getFirstRange();

    editor.model.change((writer) => {
      const position = range.end;

      // Get the character before the cursor
      const backwardPosition = position.getShiftedBy(-1);
      const backwardRange = writer.createRange(backwardPosition, position);
      const backwardText = Array.from(backwardRange.getItems())
        .map((item) => item.data)
        .join("");

      // Check if the last character typed is "@"
      if (backwardText === "@") {
        // Remove the last typed "@"
        writer.remove(backwardRange);
      }

      // Insert "@User Label" with bold formatting
      const userText = `@${user.label} `;
      writer.insertText(userText, { bold: true }, backwardPosition);

      // Move the cursor after the inserted text
      const newPosition = backwardPosition.getShiftedBy(userText.length);
      writer.setSelection(newPosition);

      // Deselect the bold formatting after inserting the text
      writer.removeSelectionAttribute("bold");
    });

    // Close the dropdown and reset matched users
    setShowDropdown(false);
    setMatchedUsers([]);
  };

  const handleInputChange = (event) => {
    const value = event.target.value;
    // Check if the input is empty
    if (value === '') {
      // If input is empty, reset to show all users
      setMatchedUsers(originalUsers);  // Assuming matchedUsers is your original list of users
    } else {
      // If input is not empty, filter the users
      const filtered = originalUsers.filter(user =>
        user.label.toLowerCase().includes(value.toLowerCase())
      );
      setMatchedUsers(filtered);
    }
  }

  return (
    <div style={{ position: 'relative' }} className='text-editor'>
      <CKEditor
        editor={ClassicEditor}
        config={{
          toolbar: ['heading', '|', 'bold', 'italic', 'link', '|', 'undo', 'redo', 'bulletedList', 'numberedList', 'blockQuote', 'indent', 'outdent'],
        }}
        data={customDecode(values.message)}
        onReady={(editor) => {
          editorRef.current = editor;

          // Handle pasted links
          handlePasteAndExitHyperlink(editor);

          // Override toolbar link behavior
          overrideToolbarLinkCommand(editor);
        }}
        onChange={(event, editor) => {
          handlePasteAndExitHyperlink(editor);
          const data = editor.getData();
          setValues((prevValues) => ({ ...prevValues, message: data }));
          if (type === "edit") {
            setMessage(data);
          }
        }}
      />

      {showDropdown && (
        <div ref={dropdownRef} style={{ position: 'absolute', top: '50px', left: '10px', width: '310px', zIndex: "10", borderRadius: "5px", fontSize: "14px", boxShadow: "0px 0px 5px #e3e1e1", }} className="message-dropdown">
          <input type="text" ref={inputRef} style={{ width: '310px' }} onChange={handleInputChange} placeholder='Search users' />
          <div className={`message-inner-drop ${matchedUsers.length > 0 ? 'user-exists' : ''}`}>
            {matchedUsers.length > 0 ? (matchedUsers.map((user, index) => (
              <div className='message-option'
                key={user.value}
                onClick={() => handleUserSelect(user)}
                style={{
                  cursor: 'pointer',
                  padding: '10px 10px',
                  backgroundColor: highlightedIndex === index ? '#e0e0e0' : 'transparent',
                }}
              >
                {user.label}
              </div>
            ))) : (
              <div style={{ padding: '10px' }}>No matching user found</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CkEditor;