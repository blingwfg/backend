import amqp from 'amqplib';


const ProcedurService = {
    sendMessage: async (queue, message) => {
        const connection = await amqp.connect(process.env.RABBITMQ_SERVER);
        const channel = await connection.createChannel();

        await channel.assertQueue(queue, {
            durable: true,
        });
        await channel.sendToQueue(queue, Buffer.from(message));
        setTimeout(() => {
            connection.close();
        }, 500);
    }
}


export default ProcedurService;