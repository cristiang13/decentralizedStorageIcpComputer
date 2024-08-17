import Blob "mo:base/Blob";
import Debug "mo:base/Debug";
import Nat8 "mo:base/Nat8";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Int "mo:base/Int";
import Result "mo:base/Result";
import Profile "canister:profile_backend";

actor {
    type Image = {
        data: Blob;
        owner: Text;
        name: Text;
        contentType: Text;
    };

    type Profile = {
        username: Text;
        email: Text;
    };


    var nextImageId: Int = 1;
   let listImages = HashMap.HashMap<Int, Image>(5, Int.equal, Int.hash);
     
    
   // Función para recibir y procesar la imagen desde el frontend.
    public shared({caller}) func uploadImage(username: Text, name: Text, contentType: Text, imageData: Blob): async  Result.Result<Int, Text> {
        // Generar un identificador único para la imagen, en este caso usando el nombre.
        let imageId: Int = nextImageId;
        
        // Consultar el canister de perfiles para verificar si el username existe
        let profileExists = await checkUsernameExists(username);


      switch (profileExists) {
            case (#err(errorMessage)) {
                // Si el username no existe, retornar un error
                return #err(errorMessage);
            };
            case (#ok(profile)) {
                // Si el username existe, proceder a crear y almacenar la imagen
                let imageId: Int = nextImageId;
                let image: Image = {
                    data = imageData;
                    owner = username; // Convierte username a Principal si es necesario
                    name = name;
                    contentType = contentType;
                };

                // Almacenar la imagen en el HashMap
                listImages.put(imageId, image);
                nextImageId += 1;

                // Retornar el identificador de la imagen como confirmación
                return #ok(imageId);
            };
        };
    };

   

     // Método para listar todos imagenes  
   public query func listImageIds(): async  [(Int, Image)] {
      let iter : Iter.Iter<(Int, Image)> = listImages.entries();
      Iter.toArray<(Int,Image)>(iter);  
    };

    // Función para obtener una imagen por su ID
    public query func getImageById(imageId: Int): async ?Image {
        return listImages.get(imageId);
    };

   // Función para verificar si un username existe
    public shared func checkUsernameExists(username: Text): async Result.Result<Profile, Text> {
        let profileResult = await Profile.getProfile(username);

        switch (profileResult) {
            case (#ok(profile)) { return #ok(profile) }; // Retorna el perfil si existe
            case (#err(_)) { return #err("Username no encontrado.") }; // Retorna un mensaje de error si no existe
        }
    };


   
  
};