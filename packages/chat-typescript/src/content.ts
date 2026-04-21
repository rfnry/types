export type TextPart = {
  type: 'text'
  text: string
}

export type ImagePart = {
  type: 'image'
  url: string
  mime: string
  name?: string
  size?: number
}

export type AudioPart = {
  type: 'audio'
  url: string
  mime: string
  name?: string
  size?: number
  durationMs?: number
}

export type DocumentPart = {
  type: 'document'
  url: string
  mime: string
  name?: string
  size?: number
}

export type FormStatus = 'pending' | 'submitted' | 'cancelled'

export type FormPart = {
  type: 'form'
  formId: string
  schema: Record<string, unknown>
  status: FormStatus
  values?: Record<string, unknown>
  answersEventId?: string
  title?: string
  description?: string
}

export type ContentPart = TextPart | ImagePart | AudioPart | DocumentPart | FormPart

export type AudioPartWire = Omit<AudioPart, 'durationMs'> & { duration_ms?: number }

export type FormPartWire = Omit<FormPart, 'formId' | 'answersEventId'> & {
  form_id: string
  answers_event_id?: string
}

export type ContentPartWire = TextPart | ImagePart | AudioPartWire | DocumentPart | FormPartWire

const FORM_STATUSES: ReadonlySet<FormStatus> = new Set(['pending', 'submitted', 'cancelled'])

export function parseContentPart(raw: unknown): ContentPartWire {
  if (typeof raw !== 'object' || raw === null) {
    throw new Error(`invalid content part: ${JSON.stringify(raw)}`)
  }
  const record = raw as Record<string, unknown>
  const type = record.type
  switch (type) {
    case 'text': {
      if (typeof record.text !== 'string') {
        throw new Error(`invalid text part: ${JSON.stringify(raw)}`)
      }
      return { type: 'text', text: record.text }
    }
    case 'image': {
      if (typeof record.url !== 'string' || record.url.length === 0) {
        throw new Error(`invalid image part url: ${JSON.stringify(raw)}`)
      }
      if (typeof record.mime !== 'string' || record.mime.length === 0) {
        throw new Error(`invalid image part mime: ${JSON.stringify(raw)}`)
      }
      return raw as ImagePart
    }
    case 'audio': {
      if (typeof record.url !== 'string' || record.url.length === 0) {
        throw new Error(`invalid audio part url: ${JSON.stringify(raw)}`)
      }
      if (typeof record.mime !== 'string' || record.mime.length === 0) {
        throw new Error(`invalid audio part mime: ${JSON.stringify(raw)}`)
      }
      return raw as AudioPartWire
    }
    case 'document': {
      if (typeof record.url !== 'string' || record.url.length === 0) {
        throw new Error(`invalid document part url: ${JSON.stringify(raw)}`)
      }
      if (typeof record.mime !== 'string' || record.mime.length === 0) {
        throw new Error(`invalid document part mime: ${JSON.stringify(raw)}`)
      }
      return raw as DocumentPart
    }
    case 'form': {
      if (typeof record.form_id !== 'string') {
        throw new Error(`invalid form part form_id: ${JSON.stringify(raw)}`)
      }
      if (typeof record.schema !== 'object' || record.schema === null) {
        throw new Error(`invalid form part schema: ${JSON.stringify(raw)}`)
      }
      if (typeof record.status !== 'string' || !FORM_STATUSES.has(record.status as FormStatus)) {
        throw new Error(`invalid form part status: ${JSON.stringify(raw)}`)
      }
      return raw as FormPartWire
    }
    default:
      throw new Error(`unknown content part type: ${JSON.stringify(type)}`)
  }
}
