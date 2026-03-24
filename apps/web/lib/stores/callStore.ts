import { create } from 'zustand'
import type { CallResultCode } from '@/types/crm'

// ─── Types ─────────────────────────────────────────────────────────────────────

type CallStatus = 'idle' | 'ringing' | 'connected' | 'ended'

export interface ActiveCall {
  contactId: string
  contactName: string
  company: string
  phone: string
  startedAt: Date
  status: CallStatus
}

export interface AppointmentData {
  date: string
  time: string
  location: 'meet' | 'in_person' | 'phone'
  addToCalendar: boolean
  generateMeetUrl: boolean
  advanceDeal: boolean
}

export interface NextActionData {
  actionType: 'call' | 'email' | 'document' | 'other' | null
  memo: string
  dueDate: string
  dueTime: string
  remindDayBefore: boolean
  remindBeforeExec: boolean
}

export interface MissedCallData {
  nextCallTiming: 'tomorrow' | 'day_after' | 'week_later' | 'custom' | 'sequence' | null
  customDate: string
  customTime: string
}

// ─── Default Values ────────────────────────────────────────────────────────────

const DEFAULT_APPOINTMENT: AppointmentData = {
  date: '',
  time: '',
  location: 'meet',
  addToCalendar: true,
  generateMeetUrl: true,
  advanceDeal: true,
}

const DEFAULT_NEXT_ACTION: NextActionData = {
  actionType: null,
  memo: '',
  dueDate: '',
  dueTime: '10:00',
  remindDayBefore: true,
  remindBeforeExec: true,
}

const DEFAULT_MISSED: MissedCallData = {
  nextCallTiming: null,
  customDate: '',
  customTime: '',
}

// ─── Store Interface ───────────────────────────────────────────────────────────

interface CallState {
  activeCall: ActiveCall | null
  showResultModal: boolean
  selectedResult: CallResultCode | null
  appointmentData: AppointmentData
  nextActionData: NextActionData
  missedCallData: MissedCallData
  durationSeconds: number   // コール後モーダルに表示する通話時間

  startCall: (contact: Pick<ActiveCall, 'contactId' | 'contactName' | 'company' | 'phone'>) => void
  endCall: () => void
  saveResult: () => void
  setSelectedResult: (result: CallResultCode) => void
  setAppointmentData: (data: Partial<AppointmentData>) => void
  setNextActionData: (data: Partial<NextActionData>) => void
  setMissedCallData: (data: Partial<MissedCallData>) => void
}

// ─── Store ─────────────────────────────────────────────────────────────────────

export const useCallStore = create<CallState>((set, get) => ({
  activeCall: null,
  showResultModal: false,
  selectedResult: null,
  appointmentData: DEFAULT_APPOINTMENT,
  nextActionData: DEFAULT_NEXT_ACTION,
  missedCallData: DEFAULT_MISSED,
  durationSeconds: 0,

  startCall: (contact) =>
    set({
      activeCall: {
        ...contact,
        startedAt: new Date(),
        status: 'connected',
      },
      showResultModal: false,
      selectedResult: null,
      appointmentData: DEFAULT_APPOINTMENT,
      nextActionData: DEFAULT_NEXT_ACTION,
      missedCallData: DEFAULT_MISSED,
    }),

  endCall: () => {
    const { activeCall } = get()
    const durationSeconds = activeCall
      ? Math.floor((Date.now() - activeCall.startedAt.getTime()) / 1000)
      : 0
    set({
      activeCall: null,
      showResultModal: true,
      durationSeconds,
    })
  },

  saveResult: () =>
    set({
      showResultModal: false,
      selectedResult: null,
      appointmentData: DEFAULT_APPOINTMENT,
      nextActionData: DEFAULT_NEXT_ACTION,
      missedCallData: DEFAULT_MISSED,
      durationSeconds: 0,
    }),

  setSelectedResult: (result) => set({ selectedResult: result }),

  setAppointmentData: (data) =>
    set((s) => ({ appointmentData: { ...s.appointmentData, ...data } })),

  setNextActionData: (data) =>
    set((s) => ({ nextActionData: { ...s.nextActionData, ...data } })),

  setMissedCallData: (data) =>
    set((s) => ({ missedCallData: { ...s.missedCallData, ...data } })),
}))
