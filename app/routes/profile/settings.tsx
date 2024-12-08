import { setUserPrefs } from '~/cookies/userPref.server';
import type { Route } from './+types/settings';
import { Form, useRouteLoaderData, useSubmit } from 'react-router';
import { IoColorPalette } from 'react-icons/io5';


export const action = async ({ request }: Route.ActionArgs) => {
    const formData = await request.formData();
    const theme = formData.get("theme-buttons") as string;
    return setUserPrefs(request, { theme });
};

export default function Settings() {
    const theme = useRouteLoaderData("root")?.theme as string;
    const submit = useSubmit()


    return (
        <div className='text-center pt-2 mx-2'>
            <h1 className='text-3xl text-primary font-semibold'>Settings</h1>
            <div className="flex flex-col">
                <div className="m-1 btn btn-ghost flex flex-row">
                    <IoColorPalette size={24} />
                    <span>Theme</span>
                </div>
                <Form method="post" action="/" onChange={e => submit(e.currentTarget, { preventScrollReset: true, navigate: false })}>
                    <div className=" z-[1] p-0 m-0  rounded-full max-w-screen-lg mx-auto">
                        <div className="flex flex-row flex-wrap gap-1 bg-neutral/10 p-1 rounded-md">
                            {themes.map((themeOption) => (
                                <input
                                    key={themeOption.value}
                                    type="radio"
                                    name="theme-buttons"
                                    defaultChecked={theme === themeOption.value}
                                    className="btn btn-sm theme-controller bg-base-100"
                                    aria-label={themeOption.label}
                                    value={themeOption.value}
                                />
                            ))}
                        </div>
                    </div>
                </Form>
            </div>
        </div>
    )
}

const themes = [
    { value: 'default', label: 'Default' },
    { value: 'garden', label: 'Garden' },
    { value: 'dracula', label: 'Dracula' },
    { value: 'emerald', label: 'Emerald' },
    { value: 'cupcake', label: 'Cupcake' },
    { value: 'coffee', label: 'Coffee' },
    { value: 'aqua', label: 'Aqua' },
    { value: 'dark', label: 'Dark' },
];