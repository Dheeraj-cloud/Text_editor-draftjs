import React, { useState, useEffect } from 'react';
import { Editor, EditorState, RichUtils, convertToRaw, convertFromRaw, Modifier } from 'draft-js';
import 'draft-js/dist/Draft.css';
import '../styles.css'; // You need to create styles.css for custom styling

const MyEditor = () => {
  const [editorState, setEditorState] = useState(EditorState.createEmpty());

  useEffect(() => {
    const savedContent = localStorage.getItem('editorContent');
    if (savedContent) {
      const contentState = convertFromRaw(JSON.parse(savedContent));
      setEditorState(EditorState.createWithContent(contentState));
    }
  }, []);

  const handleSave = () => {
    const contentState = editorState.getCurrentContent();
    const contentJson = JSON.stringify(convertToRaw(contentState));
    localStorage.setItem('editorContent', contentJson);
  };

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);

    if (newState) {
      setEditorState(newState);
      return 'handled';
    }

    return 'not-handled';
  };


  const handleChange = (newEditorState) => {
    setEditorState(newEditorState);
  };

  const handleBeforeInput = (chars, editorState) => {
    const selectionState = editorState.getSelection();
    const contentState = editorState.getCurrentContent();
    const currentBlock = contentState.getBlockForKey(selectionState.getStartKey());
    const blockType = currentBlock.getType();
    const lastBlock = contentState.getLastBlock();
    const lastBlockText = lastBlock.getText();

    if (chars === " " && contentState.getLastBlock().getText() === '#' && blockType !== 'header-one') {
      const selectionState = editorState.getSelection();
      const newContentState = Modifier.setBlockType(contentState, selectionState, 'heading');
      const withoutHash = lastBlockText.slice(0, -1);
      const newContentStateWithoutHash = Modifier.replaceText(newContentState, selectionState.merge({
        anchorOffset: lastBlockText.length - 1,
        focusOffset: lastBlockText.length,
        isBackward: false
      }), withoutHash);
      const newEditorState = EditorState.push(editorState, newContentStateWithoutHash, 'remove-hash');
      setEditorState(newEditorState);
      return 'handled';
    }


    if (chars === " " && contentState.getLastBlock().getText() === '*' && blockType !== 'BOLD') {
      const selectionState = editorState.getSelection();
      const newContentState = Modifier.setBlockType(contentState, selectionState, 'bold');
      const withoutAsterisks = lastBlockText.slice(0, -1);
      const newContentStateWithoutAsterisks = Modifier.replaceText(newContentState, selectionState.merge({
        anchorOffset: lastBlockText.length - 1,
        focusOffset: lastBlockText.length,
        isBackward: false
      }), withoutAsterisks);
      const newEditorState = EditorState.push(editorState, newContentStateWithoutAsterisks, 'remove-asterisks');
      setEditorState(newEditorState);
      return 'handled';
    }



    if (chars === ' ' && contentState.getLastBlock().getText() === '**') {
      const selectionState = editorState.getSelection();
      const newContentState = Modifier.setBlockType(contentState, selectionState, 'red-line');
      const withoutAsterisks = lastBlockText.slice(0, -2);
      const newContentStateWithoutAsterisks = Modifier.replaceText(newContentState, selectionState.merge({
        anchorOffset: lastBlockText.length - 2,
        focusOffset: lastBlockText.length,
        isBackward: false
      }), withoutAsterisks);
      const newEditorState = EditorState.push(editorState, newContentStateWithoutAsterisks, 'remove-asterisks');
      setEditorState(newEditorState);
      return 'handled';
    }

    if (chars === ' ' && lastBlockText.endsWith('***')) {
      const selectionState = editorState.getSelection();
      const newContentState = Modifier.setBlockType(contentState, selectionState, 'underline');
      const withoutAsterisks = lastBlockText.slice(0, -3);
      const newContentStateWithoutAsterisks = Modifier.replaceText(newContentState, selectionState.merge({
        anchorOffset: lastBlockText.length - 3,
        focusOffset: lastBlockText.length,
        isBackward: false
      }), withoutAsterisks);
      const newEditorState = EditorState.push(editorState, newContentStateWithoutAsterisks, 'remove-asterisks');
      setEditorState(newEditorState);
      return 'handled';
    }


    return 'not-handled';
  };

  const blockStyleFn = (contentBlock) => {
    const type = contentBlock.getType();
    if (type === 'red-line') {
      return 'red-line';
    }

    if (type === 'underline') {
      return 'underline';
    }

    if (type === 'bold') {
      return 'bold'
    }

    if (type === 'heading') {
      return 'heading'
    }


    return null;
  };

  return (
    <div className="editor-container">
      <div className="title">Text-Editor</div>
      <button className="save-button" onClick={handleSave}>
        Save
      </button>
      <Editor
        editorState={editorState}
        handleKeyCommand={handleKeyCommand}
        onChange={handleChange}
        handleBeforeInput={handleBeforeInput}
        blockStyleFn={blockStyleFn}
      />
    </div>
  );
};

export default MyEditor;
