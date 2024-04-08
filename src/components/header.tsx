import { signIn, signOut, useSession } from "next-auth/react"

export const Header = () => {
    const { data: session } = useSession();

    const customName = session?.user?.name?.split(" ");
    const nameFirst = customName?.map((str)=>str.charAt(0)).join("")


    return (
        <div className="w-full flex justify-between px-2 py-4 font-family: Times New Roman bg-gradient-to-r from-yellow-100 via-gray-100 to-gray-200">
            <div className="text-sm md:text-base lg:text-xl text-center font-bold text-gray-800">T3 TODO APP</div>
            <div>
                {session?.user ? (
                    <div className="flex flex-row gap-2">
                        <h2 className="text-indigo-900 text-sm bg-[#f2d680] md:text-base lg:text-2xl text-bold  rounded-full border-yellow-50 p-2 text-center">{nameFirst}</h2>
                        <button onClick={() => void signOut()} className="bg-indigo-500 font-family-Georgia  px-1 md:px-2 lg:px-2 border-2 rounded border-yellow-50 text-white font-weight-700 hover:bg-indigo-500 text-sm md:text-base lg:text-base text-center">Sign Out</button>
                    </div>
                ) : (
                    <button onClick={() => void signIn("google")} 
                    className="bg-blue-500 font-family-Georgia p-1 px-2 border-2 rounded border-yellow-50 text-white font-weight-700 hover:bg-indigo-500"
                    >Sign In</button>
                )}
            </div>
        </div>
    )
}