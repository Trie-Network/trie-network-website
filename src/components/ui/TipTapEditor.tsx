import { useEffect, useState } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import { Bold, Italic, Underline as UnderlineIcon, ChevronDown, List, ListOrdered, Code } from 'lucide-react';
import { getNetworkColor } from '@/config/colors';

interface TipTapEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  description?: string;
}

const LAYOUT_CLASSES = {
  container: 'w-full',
  label: 'block text-sm font-medium text-gray-700 mb-2',
  required: 'text-red-500 ml-1',
  tabContainer: 'flex border-b border-gray-300 mb-0',
  tab: 'px-4 py-2 text-sm font-medium transition-colors cursor-pointer',
  activeTab: 'border-b-2 text-gray-900',
  inactiveTab: 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent',
  editorContainer: 'border border-gray-300 rounded-b-lg bg-white',
  editorContent: 'prose prose-sm max-w-none px-3 py-3 focus:outline-none min-h-[150px] text-gray-900',
  preview: 'px-3 py-3 min-h-[150px] prose prose-sm max-w-none rounded-b-lg text-gray-900',
  emptyPreview: 'text-gray-400 italic',
  helperText: 'text-xs text-gray-500 mt-2',
  toolbar: 'flex flex-wrap gap-1 p-2 border-b border-gray-300 bg-gray-50',
  toolbarButton: 'p-2 text-gray-700 rounded hover:bg-gray-200 transition-colors',
  toolbarButtonActive: 'bg-gray-300',
  divider: 'w-px bg-gray-300 mx-1',
  dropdown: 'relative',
  dropdownButton: 'px-3 py-1 text-sm text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center gap-1',
  dropdownMenu: 'absolute top-full left-0 mt-1 bg-white border border-gray-300 rounded shadow-lg z-10 min-w-[120px]',
  dropdownItem: 'px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer transition-colors',
  dropdownItemActive: 'bg-gray-100 font-semibold'
} as const;

export function TipTapEditor({
  value,
  onChange,
  placeholder = 'Enter description...',
  label,
  required = false,
  description
}: TipTapEditorProps) {
  const networkColor = getNetworkColor();
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const [showHeadingDropdown, setShowHeadingDropdown] = useState(false);
  const [showListDropdown, setShowListDropdown] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6]
        }
      }),
      Placeholder.configure({
        placeholder: placeholder
      }),
      Underline
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: LAYOUT_CLASSES.editorContent,
        style: `min-height: ${150}px;`
      }
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
    onSelectionUpdate: () => {
      // Force re-render when selection changes (includes stored marks)
      setUpdateTrigger(prev => prev + 1);
    },
    onTransaction: () => {
      // Also re-render on any transaction (includes toggle marks)
      setUpdateTrigger(prev => prev + 1);
    }
  });

  // Update editor content when value prop changes externally
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value || '');
    }
  }, [value, editor]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showHeadingDropdown) {
        setShowHeadingDropdown(false);
      }
      if (showListDropdown) {
        setShowListDropdown(false);
      }
    };

    if (showHeadingDropdown || showListDropdown) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showHeadingDropdown, showListDropdown]);

  if (!editor) {
    return null;
  }

  // Helper to check if a mark is active or stored (pending)
  const isMarkActive = (markType: string) => {
    if (!editor) return false;

    // Check if mark is active in current position
    if (editor.isActive(markType)) return true;

    // Check if mark is stored (will be applied on next input)
    const { storedMarks } = editor.state;
    if (storedMarks) {
      return storedMarks.some(mark => mark.type.name === markType);
    }

    return false;
  };

  const ToolbarButton = ({
    onClick,
    isActive,
    children
  }: {
    onClick: () => void;
    isActive?: boolean;
    children: React.ReactNode;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={`${LAYOUT_CLASSES.toolbarButton} ${isActive ? LAYOUT_CLASSES.toolbarButtonActive : ''}`}
      style={isActive ? { backgroundColor: networkColor + '20', color: networkColor } : {}}
    >
      {children}
    </button>
  );

  const getTabClasses = (tabName: 'write' | 'preview') => {
    const isActive = activeTab === tabName;
    return `${LAYOUT_CLASSES.tab} ${isActive ? LAYOUT_CLASSES.activeTab : LAYOUT_CLASSES.inactiveTab}`;
  };

  const getActiveTabStyle = (tabName: 'write' | 'preview') => {
    if (activeTab === tabName) {
      return {
        borderBottomColor: networkColor,
        color: networkColor
      };
    }
    return {};
  };

  // Get current heading level text for dropdown button
  const getCurrentHeadingText = () => {
    for (let level = 1; level <= 6; level++) {
      if (editor.isActive('heading', { level })) {
        return `H${level}`;
      }
    }
    // Check if it's a paragraph (not a heading)
    if (editor.isActive('paragraph')) {
      return 'Paragraph';
    }
    return 'Paragraph';
  };

  // Handle heading selection from dropdown
  const setHeading = (level: number) => {
    editor.commands.setHeading({ level: level as 1 | 2 | 3 | 4 | 5 | 6 });
    setShowHeadingDropdown(false);
    setTimeout(() => editor.commands.focus(), 0);
  };

  // Set to paragraph (remove heading)
  const setParagraph = () => {
    editor.commands.setParagraph();
    setShowHeadingDropdown(false);
    setTimeout(() => editor.commands.focus(), 0);
  };

  // Get current list type text for dropdown button
  const getCurrentListText = () => {
    if (editor.isActive('bulletList')) {
      return 'Bullet';
    }
    if (editor.isActive('orderedList')) {
      return 'Numbered';
    }
    return 'List';
  };

  // Handle list type selection
  const setListType = (type: 'bullet' | 'numbered') => {
    if (type === 'bullet') {
      editor.chain().focus().toggleBulletList().run();
    } else {
      editor.chain().focus().toggleOrderedList().run();
    }
    setShowListDropdown(false);
  };

  return (
    <div className={LAYOUT_CLASSES.container}>
      {/* Label */}
      {label && (
        <label className={LAYOUT_CLASSES.label}>
          {label}
          {required && <span className={LAYOUT_CLASSES.required}>*</span>}
        </label>
      )}

      {/* Tab Navigation */}
      <div className={LAYOUT_CLASSES.tabContainer}>
        <button
          type="button"
          onClick={() => setActiveTab('write')}
          className={getTabClasses('write')}
          style={getActiveTabStyle('write')}
        >
          Write
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('preview')}
          className={getTabClasses('preview')}
          style={getActiveTabStyle('preview')}
        >
          Preview
        </button>
      </div>

      {/* Editor Container */}
      <div className={LAYOUT_CLASSES.editorContainer}>
        {activeTab === 'write' ? (
          <>
            {/* Toolbar */}
            <div className={LAYOUT_CLASSES.toolbar}>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleBold().run()}
                isActive={isMarkActive('bold')}
              >
                <Bold size={18} />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleItalic().run()}
                isActive={isMarkActive('italic')}
              >
                <Italic size={18} />
              </ToolbarButton>
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleUnderline().run()}
                isActive={isMarkActive('underline')}
              >
                <UnderlineIcon size={18} />
              </ToolbarButton>
              <div className={LAYOUT_CLASSES.divider} />

              {/* Heading Dropdown */}
              <div className={LAYOUT_CLASSES.dropdown}>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowHeadingDropdown(!showHeadingDropdown);
                  }}
                  className={LAYOUT_CLASSES.dropdownButton}
                >
                  {getCurrentHeadingText()}
                  <ChevronDown size={14} />
                </button>
                {showHeadingDropdown && (
                  <div className={LAYOUT_CLASSES.dropdownMenu} onMouseDown={(e) => e.preventDefault()}>
                    <div
                      onClick={() => setParagraph()}
                      className={`${LAYOUT_CLASSES.dropdownItem} ${
                        editor.isActive('paragraph') ? LAYOUT_CLASSES.dropdownItemActive : ''
                      }`}
                    >
                      Paragraph
                    </div>
                    <div
                      onClick={() => setHeading(1)}
                      className={`${LAYOUT_CLASSES.dropdownItem} ${
                        editor.isActive('heading', { level: 1 }) ? LAYOUT_CLASSES.dropdownItemActive : ''
                      }`}
                    >
                      H1
                    </div>
                    <div
                      onClick={() => setHeading(2)}
                      className={`${LAYOUT_CLASSES.dropdownItem} ${
                        editor.isActive('heading', { level: 2 }) ? LAYOUT_CLASSES.dropdownItemActive : ''
                      }`}
                    >
                      H2
                    </div>
                    <div
                      onClick={() => setHeading(3)}
                      className={`${LAYOUT_CLASSES.dropdownItem} ${
                        editor.isActive('heading', { level: 3 }) ? LAYOUT_CLASSES.dropdownItemActive : ''
                      }`}
                    >
                      H3
                    </div>
                    <div
                      onClick={() => setHeading(4)}
                      className={`${LAYOUT_CLASSES.dropdownItem} ${
                        editor.isActive('heading', { level: 4 }) ? LAYOUT_CLASSES.dropdownItemActive : ''
                      }`}
                    >
                      H4
                    </div>
                    <div
                      onClick={() => setHeading(5)}
                      className={`${LAYOUT_CLASSES.dropdownItem} ${
                        editor.isActive('heading', { level: 5 }) ? LAYOUT_CLASSES.dropdownItemActive : ''
                      }`}
                    >
                      H5
                    </div>
                    <div
                      onClick={() => setHeading(6)}
                      className={`${LAYOUT_CLASSES.dropdownItem} ${
                        editor.isActive('heading', { level: 6 }) ? LAYOUT_CLASSES.dropdownItemActive : ''
                      }`}
                    >
                      H6
                    </div>
                  </div>
                )}
              </div>

              <div className={LAYOUT_CLASSES.divider} />

              {/* List Dropdown */}
              <div className={LAYOUT_CLASSES.dropdown}>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowListDropdown(!showListDropdown);
                  }}
                  className={LAYOUT_CLASSES.dropdownButton}
                >
                  {getCurrentListText()}
                  <ChevronDown size={14} />
                </button>
                {showListDropdown && (
                  <div className={LAYOUT_CLASSES.dropdownMenu}>
                    <div
                      onClick={() => setListType('bullet')}
                      className={`${LAYOUT_CLASSES.dropdownItem} ${
                        editor.isActive('bulletList') ? LAYOUT_CLASSES.dropdownItemActive : ''
                      }`}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <List size={16} />
                      <span>Bullet List</span>
                    </div>
                    <div
                      onClick={() => setListType('numbered')}
                      className={`${LAYOUT_CLASSES.dropdownItem} ${
                        editor.isActive('orderedList') ? LAYOUT_CLASSES.dropdownItemActive : ''
                      }`}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <ListOrdered size={16} />
                      <span>Numbered List</span>
                    </div>
                  </div>
                )}
              </div>

              <div className={LAYOUT_CLASSES.divider} />
              <ToolbarButton
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
                isActive={editor.isActive('codeBlock')}
              >
                <Code size={18} />
              </ToolbarButton>
            </div>

            {/* Editor Content */}
            <EditorContent editor={editor} />
          </>
        ) : (
          <div className={LAYOUT_CLASSES.preview}>
            {value && value !== '<p></p>' ? (
              <div dangerouslySetInnerHTML={{ __html: value }} />
            ) : (
              <p className={LAYOUT_CLASSES.emptyPreview}>
                Nothing to preview. Switch to the Write tab to add content.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Helper Text */}
      {description ? (
        <p className={LAYOUT_CLASSES.helperText}>{description}</p>
      ) : (
        <p className={LAYOUT_CLASSES.helperText}>
          Rich text editor with formatting options available in the toolbar above.
        </p>
      )}
    </div>
  );
}
