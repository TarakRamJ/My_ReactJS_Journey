const fruits=[
    { title: 'Cabbage', isFruit: false, id: 1 },
  { title: 'Garlic', isFruit: false, id: 2 },
  { title: 'Apple', isFruit: true, id: 3 }
];

export default function List(){
    var list = fruits.map((fruit)=>
        <li key={fruit.id} style={{color:fruit.isFruit? 'green' : 'red'}}>{fruit.title}</li>
    );
    return(
        <>
        <ol>{list}</ol>
        </>
    );
}