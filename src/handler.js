const { nanoid } = require('nanoid');

const notes = require('./notes');

const sendFailedResponse = (h, statusCode = 500, message = 'Catatan gagal ditambahkan') => {
  const response = h.response({
    status: 'fail',
    message,
  });

  response.code(statusCode);

  return response;
};

const sendSuccessResponse = function (h, message = '', statusCode = 200, data = null) {
  const response = h.response({
    status: 'success',
    message,
    data,
  });

  response.code(statusCode);

  return response;
};

module.exports = {
  addNoteHandler: (request, h) => {
    const { title = 'untitled', tags, body } = request.payload;

    const id = nanoid(16);
    const createdAt = new Date().toISOString();
    const updatedAt = createdAt;

    notes.push({
      title, tags, body, id, createdAt, updatedAt,
    });

    const isSuccess = notes.filter((note) => note.id === id).length > 0;

    if (isSuccess) {
      return sendSuccessResponse(h, 'Catatan berhasil ditambahkan', 201, {
        noteId: id,
      });
    }

    return sendFailedResponse(h);
  },
  getAllNotesHandler: () => ({
    status: 'success',
    data: {
      notes,
    },
  }),
  getNoteByIdHandler: (request, h) => {
    const { id } = request.params;
    const note = notes.filter((n) => n.id === id)[0];

    if (note !== undefined) {
      return {
        status: 'success',
        data: {
          note,
        },
      };
    }

    return sendFailedResponse(h, 404);
  },
  editNoteByIdHandler: (request, h) => {
    const { id } = request.params;
    const { title, tags, body } = request.payload;

    const updatedAt = new Date().toISOString();
    const index = notes.findIndex((note) => note.id === id);

    if (index !== -1) {
      notes[index] = {
        ...notes[index],
        title,
        tags,
        body,
        updatedAt,
      };

      return sendSuccessResponse(h, 'Catatan berhasil diperbarui', 200);
    }

    return sendFailedResponse(h, 404, 'Gagal memperbarui catatan. Id tidak ditemukan');
  },
  deleteNoteByIdHandler: (request, h) => {
    const { id } = request.params;
    const index = notes.findIndex((note) => note.id === id);

    if (index !== -1) {
      notes.splice(index, 1);
      return sendSuccessResponse(h, 'Catatan berhasil dihapus', 200);
    }

    return sendFailedResponse(h, 404, 'Catatan gagal dihapus. Id tidak ditemukan');
  },
};
