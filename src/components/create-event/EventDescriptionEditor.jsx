import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'

const quillModules = {
  toolbar: [
    [{ header: [1, 2, 3, false] }],
    ['bold', 'italic', 'underline'],
    [{ list: 'ordered' }, { list: 'bullet' }],
    ['link'],
    ['clean']
  ]
}

const quillFormats = [
  'header',
  'bold',
  'italic',
  'underline',
  'list',
  'bullet',
  'link'
]

/**
 * "About Event" rich text editor. `onChange` receives the new HTML value
 * directly (this is how ReactQuill's onChange is shaped).
 */
const EventDescriptionEditor = ({ value, onChange }) => {
  return (
    <div className='space-y-3 sm:space-y-4'>
      <h3 className='text-lg sm:text-xl font-semibold text-white flex items-center gap-2'>
        About Event
      </h3>
      <div className='bg-zinc-900 border border-zinc-800 rounded-xl sm:rounded-2xl overflow-hidden focus-within:ring-1 focus-within:ring-zinc-700 transition-all'>
        <div className='quill-wrapper-minimal'>
          <ReactQuill
            theme='snow'
            value={value}
            onChange={onChange}
            modules={quillModules}
            formats={quillFormats}
            placeholder='Tell the story of your event...'
            className='text-zinc-300'
          />
        </div>
      </div>
    </div>
  )
}

export default EventDescriptionEditor