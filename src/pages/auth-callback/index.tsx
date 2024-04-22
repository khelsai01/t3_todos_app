// import { signIn } from 'next-auth/react'
// import React, { useState } from 'react'
// import Organization from '../organization'
// const Login = () => {
//   const [email, setEmail] = useState('')

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     const result = await signIn('email', { email })
//     if (result?.error) {
//       // Handle login error
//       console.error(result.error)
//     } 
//   }

//   return (
//     <div>
//       <h1>Login Page</h1>
//       <form onSubmit={handleSubmit}>
    
//         <button type="submit">Sign In</button>
//       </form>
//     </div>
//   )
// }

// export default Login
