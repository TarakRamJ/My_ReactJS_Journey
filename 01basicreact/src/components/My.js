import './style.css';
const user={
    name:"Tarak",
    image:'https://i.imgur.com/yXOvdOSs.jpg',
    imageSize:200
};
function my(){
    return(
        <>
            <h4 className="name"> {user.name}'s App !! </h4>
            <img className="img" 
            src={user.image} 
            alt={user.name} 
            style={{ width:user.imageSize,height:user.imageSize }}/>
        </>
    );
}

export default my;