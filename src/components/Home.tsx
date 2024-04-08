import Image from "next/image"
import todolist from "@/images/todolist.jpg"

 const Landing = () => {

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#e0f2fe]">

            <div className="flex justify-center items-center h-[90vh]">

                <h1 className="text-7xl font-bold text-gray-800 text-center">
                    <span className="text-[#4a044e] my-2 ">Welcome</span> to the<span></span><br />
                    <span className="text-blue-600"> T3 Todo app</span>
                </h1>
            </div>
            <Image src={todolist}
            alt="todolist"
           
                className=" m-auto h-[90vh] w-[100%]" />

        </div>
    )
}


export default Landing