import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { getNetworkColor } from '@/config/colors';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
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
  contentContainer: 'border border-gray-300 rounded-b-lg',
  textarea: 'w-full px-3 py-3 text-gray-900 focus:outline-none focus:ring-2 focus:ring-opacity-50 resize-none rounded-b-lg',
  preview: 'px-3 py-3 min-h-[150px] prose prose-sm max-w-none rounded-b-lg text-gray-900',
  emptyPreview: 'text-gray-400 italic',
  helperText: 'text-xs text-gray-500 mt-2',
  link: 'text-blue-500 hover:text-blue-600 underline'
} as const;

export function MarkdownEditor({
  value,
  onChange,
  placeholder = 'Enter description...',
  rows = 6,
  label,
  required = false,
  description
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'write' | 'preview'>('write');
  const networkColor = getNetworkColor();

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

      {/* Content Area */}
      <div className={LAYOUT_CLASSES.contentContainer}>
        {activeTab === 'write' ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={rows}
            className={LAYOUT_CLASSES.textarea}
          />
        ) : (
          <div className={LAYOUT_CLASSES.preview}>
            {value ? (
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {value}
              </ReactMarkdown>
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
          Markdown supported.{' '}
          <a
            href="https://guides.github.com/features/mastering-markdown/"
            target="_blank"
            rel="noopener noreferrer"
            className={LAYOUT_CLASSES.link}
          >
            Formatting guide
          </a>
        </p>
      )}
    </div>
  );
}
