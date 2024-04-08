

 const Landing = () => {

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[#e0f2fe]">

            <div className="flex justify-center items-center h-[90vh]">

                <h1 className="text-7xl font-bold text-gray-800 text-center">
                    <span className="text-[#4a044e] my-2 ">Welcome</span> to the<span></span><br />
                    <span className="text-blue-600"> T3 Todo app</span>
                </h1>
            </div>
            <img src="https://img.freepik.com/free-vector/hand-drawn-man-checking-giant-check-list-background_23-2148093614.jpg?w=740&t=st=1712566023~exp=1712566623~hmac=773150f5b00a15e0330242a05eadf96ba0198bc111bb2f425c50d3bbfc1084e8" alt="todolist"
                className=" m-auto h-[90vh] w-[100%]" />

        </div>
    )
}


export default Landing