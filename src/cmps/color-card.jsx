

export function ColorCard({color, onClick, flash}) {



    return (
        <div onClick={onClick} className={`color-card ${color} ${flash ? "flash" : ""}`}>
            
        </div>
    )
}