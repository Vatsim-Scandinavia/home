function convertZulu(time: string) {

    try {
        const outputString = (time).split(" ")[1].substring(0, 5) + "z";
        return outputString
    } catch (error) {
        return time
    }
    
}

export default convertZulu