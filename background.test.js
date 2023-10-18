// background.test.js

const { getCompleteDataInBackground } = ('src/background/background'); // Import your module

// Mock dependencies and setup a spy to track function calls
// jest.mock('./your-dependency', () => ({
//     getCompleteData: jest.fn(),
//     setStorage: jest.fn(),
// }));

describe('getCompleteDataInBackground', () => {
    it('should set completeData if data is empty', async () => {
        const { getCompleteData, setStorage } = require('./your-dependency');

        // Mock the getCompleteData function to return an empty data object
        getCompleteData.mockResolvedValue({});

        await getCompleteDataInBackground();

        expect(getCompleteData).toHaveBeenCalled();
        expect(setStorage).toHaveBeenCalledWith(expect.objectContaining({ /* your expected data */ }));
    });

    it('should update completeData if data is not empty', async () => {
        const { getCompleteData, setStorage } = require('./your-dependency');

        // Mock the getCompleteData function to return some data
        const testData = { /* your test data */ };
        getCompleteData.mockResolvedValue(testData);

        await getCompleteDataInBackground();

        expect(getCompleteData).toHaveBeenCalled();
        expect(setStorage).not.toHaveBeenCalled();
        // Make additional assertions if needed to verify completeData update
    });
});
