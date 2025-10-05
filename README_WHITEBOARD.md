# Mathematical Whiteboard with AI Recognition

This project adds a whiteboard page to your React frontend that can recognize handwritten mathematical expressions using the PyTorch model from [Pytorch-Handwritten-Mathematical-Expression-Recognition](https://github.com/whywhs/Pytorch-Handwritten-Mathematical-Expression-Recognition).

## Features

- **Interactive Whiteboard**: Draw mathematical expressions with mouse or touch
- **AI Recognition**: Uses PyTorch model to recognize handwritten math
- **Real-time Processing**: Get instant recognition results
- **History Tracking**: Keep track of previously recognized expressions
- **Export Functionality**: Download your drawings as images
- **Responsive Design**: Works on desktop and mobile devices

## Setup Instructions

### Frontend Setup

The whiteboard page is already integrated into your React app. You can access it at `/whiteboard`.

### Backend Setup (Optional)

For full AI recognition functionality, you can set up the Python backend:

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Install Python dependencies:**
   ```bash
   python setup.py
   ```

3. **Set up the PyTorch model:**
   - Clone the original repository:
     ```bash
     git clone https://github.com/whywhs/Pytorch-Handwritten-Mathematical-Expression-Recognition.git
     ```
   - Follow their setup instructions to train or download the model
   - Place the model files in the `backend/model` directory
   - Update the model loading code in `backend/app.py`

4. **Run the backend server:**
   ```bash
   python app.py
   ```

### Docker Setup (Alternative)

You can also use Docker for easier deployment:

```bash
cd backend
docker-compose up
```

## Usage

1. **Access the Whiteboard**: Navigate to `/whiteboard` in your React app
2. **Draw Expressions**: Use your mouse or touch to draw mathematical expressions
3. **Customize Drawing**: Adjust stroke color and width using the controls
4. **Recognize**: Click "Recognize Expression" to get AI interpretation
5. **View Results**: See the recognized mathematical expression
6. **History**: View previously recognized expressions
7. **Export**: Download your drawings as PNG images

## API Endpoints

The backend provides the following endpoints:

- `POST /api/recognize` - Recognize mathematical expressions from images
- `GET /api/health` - Health check endpoint

### Request Format

```json
{
  "image": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA..."
}
```

### Response Format

```json
{
  "success": true,
  "expression": "x² + 2x + 1",
  "confidence": 0.85
}
```

## Integration with PyTorch Model

The whiteboard integrates with the PyTorch Handwritten Mathematical Expression Recognition model by:

1. **Image Capture**: Converting canvas drawings to base64 images
2. **Preprocessing**: Resizing and normalizing images for the model
3. **Recognition**: Using the trained PyTorch model for expression recognition
4. **Post-processing**: Converting model output to readable mathematical expressions

## Fallback Mode

If the backend is not available, the whiteboard will fall back to mock recognition results, allowing you to test the interface without setting up the full AI backend.

## Development

### Frontend Development

The whiteboard is built with:
- React with TypeScript
- Canvas API for drawing
- Tailwind CSS for styling
- Shadcn/ui components

### Backend Development

The backend is built with:
- Flask for the web server
- PyTorch for AI model inference
- PIL for image processing
- CORS for cross-origin requests

## Troubleshooting

### Common Issues

1. **Backend not starting**: Check Python dependencies and model files
2. **Recognition not working**: Verify backend is running on port 5000
3. **Canvas not drawing**: Check browser compatibility and touch events
4. **CORS errors**: Ensure Flask-CORS is properly configured

### Debug Mode

Enable debug mode by setting `FLASK_ENV=development` in your environment variables.

## Contributing

To contribute to this project:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project integrates with the [Pytorch-Handwritten-Mathematical-Expression-Recognition](https://github.com/whywhs/Pytorch-Handwritten-Mathematical-Expression-Recognition) repository, which is licensed under MIT.

## Acknowledgments

- Original PyTorch model by [whywhs](https://github.com/whywhs)
- React frontend built with modern web technologies
- Integration inspired by educational technology needs
