import { Outlet } from 'react-router'

export default function ProfileLayout() {
    return (
        <div className='min-h-[80vh]'>
            <Outlet />
        </div>
    )
}
