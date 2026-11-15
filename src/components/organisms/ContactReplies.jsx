export default function ContactReplies({ replies = [] }) {
    return replies.length ? <ol className="contact-history">{replies.map((reply, index) => <li key={index}>
        <h3 className="h5">Respuesta de KYNEX</h3><time dateTime={reply.createdAt}>{new Date(reply.createdAt).toLocaleString("es-CL")}</time>
        <p className="contact-text">{reply.text}</p>
    </li>)}</ol> : <p>Esta consulta todavía no tiene una respuesta publicada.</p>;
}
