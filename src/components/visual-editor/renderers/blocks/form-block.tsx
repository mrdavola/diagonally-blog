import type { EditorBlock } from "@/lib/visual-editor/types"

interface FormField {
  label: string
  type: string
  required?: boolean
}

interface FormBlockProps {
  block: EditorBlock
}

export function FormBlock({ block }: FormBlockProps) {
  const rawFields = Array.isArray(block.props.fields) ? block.props.fields : []
  const fields: FormField[] = rawFields.filter(
    (f): f is FormField =>
      typeof f === "object" &&
      f !== null &&
      typeof (f as FormField).label === "string"
  )
  const submitLabel =
    typeof block.props.submitLabel === "string"
      ? block.props.submitLabel
      : "Submit"

  if (fields.length === 0) {
    return (
      <div className="flex items-center justify-center w-full h-24 bg-gray-100 border-2 border-dashed border-gray-300 rounded text-gray-400 text-sm">
        No form fields configured
      </div>
    )
  }

  return (
    <form className="flex flex-col gap-4 w-full" onSubmit={(e) => e.preventDefault()}>
      {fields.map((field, i) => (
        <div key={i} className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">
            {field.label}
            {field.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {field.type === "textarea" ? (
            <textarea
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none resize-none h-24"
              placeholder={field.label}
              readOnly
            />
          ) : field.type === "select" ? (
            <select className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none bg-white">
              <option>Select {field.label}</option>
            </select>
          ) : (
            <input
              type={field.type ?? "text"}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none"
              placeholder={field.label}
              readOnly
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        className="mt-2 self-start rounded-md bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
      >
        {submitLabel}
      </button>
    </form>
  )
}
