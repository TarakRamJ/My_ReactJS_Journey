import App from './App';
import My from './My';

const isLogin = true;
// if(isLogin){
//   <My />
// }else{
//   <App />
// }
export default function Check(){
    return(
        <>
        {/* { isLogin && <><My /> <h2>Hello</h2></> } */}
        { isLogin ? (<><My /> <h2>Hello</h2></>) : (<App />) }
        </>
    )
}
