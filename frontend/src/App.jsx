import { Navigate, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx"
import Signup from "./pages/Signup.jsx"
import ProblemPage from "./pages/Problem.jsx";
import HeaderPage from "./pages/Header.jsx"
import Homepage from "./pages/Home.jsx"
import { checkAuth } from "./authSlice.js";
import { useDispatch , useSelector } from "react-redux";
import Admin from "./pages/Admin.jsx";
import CreateProblem from "./component/CreateProblem.jsx";
import AdminDelete from "./component/AdminDelete.jsx";


import {useEffect} from "react"
function App(){
    
  //code likh isAuthentciated
                          //useSelector ki madad se sare state variable read karoge
  const {isAuthenticated,user , loading} = useSelector((state)=>state.auth);
  const dispatch = useDispatch();

  useEffect(()=>{
    dispatch(checkAuth());
  },[dispatch]);  //khali rakh sakte ho ek hi bar chalana hai 
  
   if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }
  {/* Navigate pahile react-dom ka part tha abhi react route me sabhi react-dom ki functionality aa chuki hai*/}
  return(
    <>
    <Routes> 
     <Route path="/" element={isAuthenticated?<Homepage></Homepage>:<Navigate to="/signup"/>}> </Route> 
    
    <Route path="/Problems" element={isAuthenticated?<ProblemPage></ProblemPage>:<Navigate to="/signup"/>}></Route>   
    <Route path="/login" element={<Login></Login>}></Route> 
    <Route path="/signup" element={<Signup></Signup>}></Route> 
    <Route path="/admin" element={<Admin></Admin>}> </Route>Admin
    <Route path="/admin/create" element={<CreateProblem></CreateProblem>}> </Route>Admin
    <Route path="/admin/delete" element={<AdminDelete></AdminDelete>}> </Route>Admin
    {/* <Route path="/admin/upload/" element={<AdminUpload></AdminUpload>}> </Route>Admin
    <Route path="/admin/" element={<Admin></Admin>}> </Route>Admin */}
    </Routes>
    </>
  )
}

export default App;
