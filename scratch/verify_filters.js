async function verifyFilters() {
    const baseUrl = 'http://localhost:3000';
    try {
        console.log('--- Fetching PAST turns ---');
        const resPast = await fetch(`${baseUrl}/turno?filter=past`);
        const dataPast = await resPast.json();
        console.log('Past Turns:', dataPast.length);
        if (dataPast.length > 0) {
            console.log('Example Past Turn:', dataPast[0].FechaHora);
        }

        console.log('\n--- Fetching FUTURE turns ---');
        const resFuture = await fetch(`${baseUrl}/turno?filter=future`);
        const dataFuture = await resFuture.json();
        console.log('Future Turns:', dataFuture.length);
        if (dataFuture.length > 0) {
            console.log('Example Future Turn:', dataFuture[0].FechaHora);
        }
    } catch (err) {
        console.error('Error verifying filters:', err.message);
    }
}

verifyFilters();
 