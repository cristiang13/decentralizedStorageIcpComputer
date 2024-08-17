import Principal "mo:base/Principal";
import Result "mo:base/Result";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import HashMap "mo:base/HashMap";

actor {

    type Profile = {
        username: Text;
        email: Text;
    };

    let profiles = HashMap.HashMap<Text, Profile>(5, Text.equal, Text.hash);

    // obtener array de Profile
    public query func getProfiles(): async [Profile] {
        let profileIter = profiles.vals();
        return Iter.toArray(profileIter);   
    };


    public func addProfile(newProfile: Profile): () {
        profiles.put(newProfile.username, newProfile);
    };

    type GetProfileResultOk = Profile;

    type GetProfileResultErr = {
        #userDoesNotExist;
        #userNotAuthenticated;
    };

    type GetProfileResult = Result.Result<GetProfileResultOk, GetProfileResultErr>;


    public query (msg) func getProfile(username : Text): async GetProfileResult {

        if (Principal.isAnonymous(msg.caller)) return #err(#userNotAuthenticated);

        let maybeProfile = profiles.get(username);

        switch(maybeProfile){
            case(null) { #err(#userDoesNotExist)};
            case(?profile) { #ok(profile) };
        }
    } ;
};
