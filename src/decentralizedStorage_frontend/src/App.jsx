import { useState } from 'react';
import { decentralizedStorage_backend } from 'declarations/decentralizedStorage_backend';

import {Form,Button,Modal} from 'react-bootstrap';

function App() {

  
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [showImage, setShowImage] = useState(null);
  const [imageList, setImageList] = useState([]);
  const [imageId, setImageId] = useState('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [imageURL, setImageURL] = useState(null);
  function handleButtonClick() {
    // setShowForm(true);
    setShowModal(true);
  }
  
  function closeModal() {
    setShowModal(false);
  }
  
  async function handleSubmitList(event){
    event.preventDefault();
    try {
      const imageList = await decentralizedStorage_backend.listImageIds();
      setImageList(imageList); // Actualiza el estado con la lista de imágenes
    } catch (error) {
      console.error("Error fetching image list:", error);
    }

  }
  async function handleSubmit(event) {
    event.preventDefault();
    
    const username = event.target.elements.username.value;
    const name = event.target.elements.name.value;
    const file = event.target.elements.file.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = async () => {
        const arrayBuffer = reader.result;
        const blob = new Uint8Array(arrayBuffer); 
        const contentType = file.type;

        try {
          const result = await decentralizedStorage_backend.uploadImage(username,name, contentType, blob);
          
          if (result.ok !== undefined) {
            // Si la respuesta tiene la clave `ok`, muestra el ID de la imagen
            const id = result.ok;
            alert(`Image uploaded successfully with ID: ${id}`);
          } else if (result.err !== undefined) {
            // Si la respuesta tiene la clave `err`, muestra el mensaje de error
            const errorMessage = result.err;
            alert(`Error uploading image: ${errorMessage}`);
          } 
       
        } catch (error) {
          console.error("Error uploading image:", error);
        }
      };

      reader.readAsArrayBuffer(file);
    } else {
      alert("Please select a file to upload.");
    }
  }


  
  async function handleShowImage(imageId) {
    try {
        const imageData = await decentralizedStorage_backend.getImageById(imageId);
        if (imageData[0] && imageData[0].data) {
            // Convertir el objeto en un array de números
            const dataArray = Object.values(imageData[0].data);
            const uint8Array = new Uint8Array(dataArray);
            
            // Convertir el Uint8Array a una cadena base64
            const base64String = btoa(String.fromCharCode.apply(null, uint8Array));
            const dataUrl = `data:${imageData[0].contentType};base64,${base64String}`;
            setImageURL(dataUrl);
            setShowImage(true); 
        } else {
            console.error("No data found for the image.");
        }
    } catch (error) {
        console.error("Error fetching image:", error);
    }
}
  return (
    <main>
      <img src="/logo2.svg" alt="DFINITY logo" />
      <br />
      <br />

      <div className="text-center mb-4">
        <h1>ICP DecentraPics</h1>
        <Button variant="primary" onClick={handleButtonClick}>Upload an Image</Button>{' '}
        <Button variant="success" onClick={handleSubmitList}>Lista Imagenes</Button>

      </div>
    
 
      <Modal show={showModal} onHide={closeModal}>
        <Modal.Header closeButton>
          <Modal.Title>Upload Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formImageName" className="mb-4">
              <Form.Label>User Name:</Form.Label>
              <Form.Control type="text" name="username" required />
            </Form.Group>
            <Form.Group controlId="formImageName" className="mb-4">
              <Form.Label>Image Name:</Form.Label>
              <Form.Control type="text" name="name" required />
            </Form.Group>
            <Form.Group controlId="formFile" className="mb-4">
              <Form.Label>Select Image:</Form.Label>
              <Form.Control type="file" name="file" accept="image/*" required />
            </Form.Group>
            <Button variant="primary" type="submit" className="me-2">Upload</Button>
            <Button variant="secondary" onClick={closeModal}>Cancel</Button>
          </Form>
        </Modal.Body>
      </Modal>

      {showImage && (
        <Modal show={true} onHide={() => setShowImage(null)}>
            <Modal.Header closeButton>
                <Modal.Title>View Image</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <img src={imageURL} alt="Uploaded" style={{ width: '100%', height: 'auto' }} />
            </Modal.Body>
        </Modal>
    )}


      {imageList.length > 0 && (
        <div className="mt-4">
          <h2>Image List</h2>
          <ul className="list-group">
            {imageList.map(([id, image]) => (
              <li key={id} className="list-group-item d-flex justify-content-between align-items-center">
                <div>
                  <strong>{image.name}</strong> (Owner: {image.owner})
                </div>
                <Button variant="info" onClick={() => handleShowImage(id)}>Show Image</Button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </main>
  );
}

export default App;
