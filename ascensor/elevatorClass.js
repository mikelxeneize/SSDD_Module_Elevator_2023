const timeInFloor = 5000; // 5 seconds per floor

class Elevator {
    constructor(elevator) { // constructor de la clase Ascensor
        this.id = elevator.id;
        this.name = elevator.nombre;
        this.enableFloors = elevator.pisos;
        this.state = elevator.state;
        this.currentFloor = 0;
    }

    moveToFloor(floor) { // metodo para mover el ascensor a un piso, este tarda 5000ms(5s) por piso
        const floorsToMove = Math.abs(floor - this.currentFloor);
        const timeToMove = floorsToMove * timeInFloor; // 5 seconds per floor
        this.setState("Ocupado")
        console.log(`Moving to floor ${floor}...`);
        setTimeout(() => {
            this.currentFloor = floor;
            console.log(`Arrived at floor ${floor}.`);
        }, timeToMove);
    }

    setState(state){
        this.state = state;
    }

    getState(){
        return this.state;
    }

}

module.exports = Elevator; // exporto la clase Ascensor
