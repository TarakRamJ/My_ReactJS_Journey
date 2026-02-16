//Count is not Updating in view "" Reason why we use "UseState" in React""


// export default function Event(){
//     let count=0;
//     function incr(){
//         // alert("clicked");
//         count++;
//     }
//     function show(){
//         alert(count);
//     }
//     return(
//         <>
//         <button onClick={incr}>Click Me</button>
//         {count}
//         <button onClick={show}>Click Me2</button>
//         </>
//     )
// }



// Here the button components are separate they dont share count


// import { useState } from "react";

// export default function Event(){
//     return(
//         <>
//         <MyButton/>
//         <MyButton/>
//         </>
//     )
// }
// function MyButton(){
//     const [count,setCount] = useState(0);
//     function incr(){
//         setCount(count+1);
//     }
//     return(
//         <button onClick={incr}>Clicked {count} times </button>
//     )
// }


//here the button componets share the count variable and be in sync


import { useState } from "react";

function MyButton({count,onClick}){
    return(
        <button onClick={onClick}> Clicked {count} times </button>
    )
}
export default function Event(){

    const [count,setCount] = useState(0);

    function incr(){
        setCount(count+1);
    }
    return(
        <>
        <MyButton count={count} onClick={incr} />
        <MyButton count={count} onClick={incr} />
        </>
    )
}
