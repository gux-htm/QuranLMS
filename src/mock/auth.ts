export interface MockUser { id:string; name:string; email:string; role:'teacher'|'student' }
// TODO: replace with API call
export const MOCK_TEACHER: MockUser={id:'teacher-1',name:'Ustadh Ahmad',email:'teacher@example.com',role:'teacher'}
// TODO: replace with API call
export const MOCK_STUDENT: MockUser={id:'student-1',name:'Student',email:'student@example.com',role:'student'}
export const MOCK_MFA_SECRET='JBSWY3DPEHPK3PXP'
