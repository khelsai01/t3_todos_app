import { signIn, signOut, useSession } from "next-auth/react"

export const Header=()=>{
    const {data:session}=useSession();
    return (
        <div className="flex justify-between px-2 py-4 border-b bg-purple-200 font-family: Georgia, Cambria">
            <div className="text-xl font-bold">T3 TODO APP</div>
            <div>
                {session?.user ? (
                    <div className="flex flex-row gap-2">
                        <p className="text-pink-900">{session.user.name}</p>
                        <button onClick={()=>void signOut()} className="text-blue-900 font-family-Georgia">Sign Out</button>
                    </div>
                ):(
                    <button onClick={()=>void signIn()}>Sign In</button> 
                )}
            </div>
        </div>
    )
}