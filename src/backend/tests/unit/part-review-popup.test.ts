import request from 'supertest';
import app from '../../index';

describe('Part_Review_Popup Endpoints', () => {
    let popupId = '';

    it('should create a popup', async () => {
        const response = await request(app)
            .post('/parts/reviewPopup/create')
            .send({ reviewId: 'some-review-id', xCoord: 10, yCoord: 20, title: 'Test Popup', description: 'Popup description' });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('partReviewPopupId');
        popupId = response.body.partReviewPopupId;
    });

    it('should update a popup', async () => {
        const response = await request(app)
            .put(`/parts/reviewPopup/${popupId}/update`)
            .send({ xCoord: 15, yCoord: 25, title: 'Updated Popup', description: 'Updated description' });

        expect(response.status).toBe(200);
        expect(response.body.title).toBe('Updated Popup');
    });

    it('should delete a popup', async () => {
        const response = await request(app).delete(`/parts/reviewPopup/${popupId}/delete`);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Popup deleted successfully');
    });
});
