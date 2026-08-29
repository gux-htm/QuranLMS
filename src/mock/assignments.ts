export interface AssignmentResponse { id:string; lessonId:string; title:string; assignedAt:string; deadline:string; status:'pending'|'completed'; score?:number }
// TODO: replace with API call
export const MOCK_ASSIGNMENTS: AssignmentResponse[]=[{id:'assignment-1',lessonId:'lesson-1',title:'Juz 1 · Pages 7–9',assignedAt:'2026-08-30',deadline:'2026-08-31',status:'pending'},{id:'assignment-2',lessonId:'lesson-2',title:'Juz 1 · Pages 4–6',assignedAt:'2026-08-20',deadline:'2026-08-27',status:'completed',score:92}]
